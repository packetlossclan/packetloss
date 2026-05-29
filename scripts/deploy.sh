#!/usr/bin/env bash

NAME="packetloss"
TMPDIR="/tmp/$NAME"
WORKDIR="/var/www/$NAME"
SERVICE="$NAME.service"
PATH=$PATH:/home/nginx/.local/share/pnpm

echo "📦 Preparando ambiente de deploy..."

echo "🔍 pnpm $(pnpm --version 2>/dev/null || echo 'não encontrado')"
PNPM_MAJOR=$(pnpm --version 2>/dev/null | cut -d. -f1)
if [ "${PNPM_MAJOR:-0}" -lt 11 ]; then
  echo "🔄 Atualizando pnpm para v11..."
  curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=11 PNPM_HOME=/home/nginx/.local/share/pnpm sh -
  hash -r 2>/dev/null || true
  echo "🔍 pnpm atualizado para $(pnpm --version 2>/dev/null)"
fi

[ -e $TMPDIR ] && rm -rf $TMPDIR
[ -e $WORKDIR ] && cp -af $WORKDIR $TMPDIR
cd $TMPDIR || exit 1

git clean -fxd -e .env -e drizzle/packetloss.db
cp .env .env.production

echo "📥 Instalando dependências..."
pnpm approve-builds --all 2>/dev/null || true
if ! pnpm install --no-frozen-lockfile; then
  echo "⚠️ Falha ao instalar dependências. Abortando o deploy..."
  exit 1
fi

echo "🗃️ Sincronizando banco de dados..."
if ! pnpm run push; then
  echo "⚠️ Falha ao sincronizar banco de dados. Abortando o deploy..."
  exit 1
fi

if pnpm run build; then
  echo "✅ Build concluído com sucesso!"
  sudo /usr/bin/systemctl stop $SERVICE
  
  [ -e $WORKDIR ] && rm -rf $WORKDIR
  [ -e $TMPDIR ] && cp -af $TMPDIR $WORKDIR

  echo "✅ Configurando contexto SELinux para /var/www/$NAME..."
  # httpd_sys_script_exec_t allows Node.js files to be executed by the service
  sudo /usr/sbin/semanage fcontext -a -t httpd_sys_script_exec_t "/var/www/$NAME(/.*)?" 2> /dev/null
  sudo /usr/sbin/restorecon -R /var/www/$NAME 2> /dev/null
  # Allow Nginx to proxy to local ports (e.g. 3050)
  sudo /usr/sbin/setsebool -P httpd_can_network_connect 1
  sudo /usr/bin/chcon -t bin_t /home/nginx/.local/share/pnpm/pnpm

  sudo /usr/bin/systemctl start $SERVICE
  echo "🚀 Serviço reiniciado!"
fi