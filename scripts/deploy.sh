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

#git clean -fxd -e .env -e local.db
git clean -fxd
#cp .env .env.production

echo "📥 Instalando dependências..."
pnpm install

# echo "🗃️ Sincronizando banco de dados..."
# pnpm run push

if [ $? -ne 0 ]; then
  echo "⚠️ Falha ao sincronizar banco de dados. Abortando o deploy..."
  exit 1
fi

if pnpm run build; then
  echo "✅ Build concluído com sucesso!"
  sudo /usr/bin/systemctl stop $SERVICE
  
  [ -e $WORKDIR ] && rm -rf $WORKDIR
  [ -e $TMPDIR ] && cp -af $TMPDIR $WORKDIR

  echo "✅ Configurando contexto SELinux para /var/www/$NAME..."
  sudo /usr/sbin/semanage fcontext -a -t httpd_sys_content_t "/var/www/$NAME(/.*)?" 2> /dev/null
  sudo /usr/sbin/restorecon -R /var/www/$NAME 2> /dev/null
  # Ensure Nginx can read static assets served directly (images, audio)
  sudo /usr/sbin/restorecon -Rv /home/nginx/.local/share/pnpm/

  sudo /usr/bin/systemctl start $SERVICE
  echo "🚀 Serviço reiniciado!"
fi