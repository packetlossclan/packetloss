#!/usr/bin/env bash

NAME="packetloss"
TMPDIR="/tmp/$NAME"
WORKDIR="/var/www/$NAME"
SERVICE="$NAME.service"
PATH=$PATH:/home/nginx/.local/share/pnpm

echo "📦 Preparando ambiente de deploy..."

[ -e $TMPDIR ] && rm -rf $TMPDIR
[ -e $WORKDIR ] && cp -af $WORKDIR $TMPDIR
cd $TMPDIR || exit 1

git clean -fxd -e .env -e drizzle/packetloss.db
cp .env .env.production

echo "📥 Instalando dependências..."
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