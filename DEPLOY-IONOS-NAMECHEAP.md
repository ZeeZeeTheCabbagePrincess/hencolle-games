# Deploy on IONOS Ubuntu with PM2 and Namecheap

This site is static, but if you want to run it behind PM2, use the included `serve.js` and `ecosystem.config.cjs`.

## 1. Point the Namecheap domain

In Namecheap DNS for `hencollegames.com`:

- Add `A` record for `@` -> `YOUR_IONOS_SERVER_IP`
- Add `A` record for `www` -> `YOUR_IONOS_SERVER_IP`

Wait for DNS to propagate.

## 2. Connect to the VPS

```bash
ssh root@YOUR_IONOS_SERVER_IP
```

Or use your normal sudo user.

## 3. Install packages

```bash
sudo apt update
sudo apt install -y nginx curl
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

## 4. Upload the site

Recommended target:

```bash
sudo mkdir -p /var/www/hencollegames
sudo chown -R $USER:$USER /var/www/hencollegames
```

Upload these files into `/var/www/hencollegames`:

- `index.html`
- `styles.css`
- `app.js`
- `events.js`
- `hencolle-icon.png`
- `serve.js`
- `ecosystem.config.cjs`

## 5. Start with PM2

```bash
cd /var/www/hencollegames
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Follow the command PM2 prints for startup persistence, then run:

```bash
pm2 save
```

Check status:

```bash
pm2 status
pm2 logs hencollegames
```

## 6. Nginx reverse proxy

Create:

```bash
sudo nano /etc/nginx/sites-available/hencollegames.com
```

Paste:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name hencollegames.com www.hencollegames.com;

    location / {
        proxy_pass http://127.0.0.1:4173;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/hencollegames.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 7. HTTPS with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d hencollegames.com -d www.hencollegames.com
```

## 8. Updating later

After you upload changed files:

```bash
cd /var/www/hencollegames
pm2 restart hencollegames
```

## 9. Useful commands

```bash
pm2 status
pm2 logs hencollegames
pm2 restart hencollegames
sudo systemctl status nginx
sudo nginx -t
```

## Optional Windows upload example

```powershell
scp "E:\the hencolle games\index.html" "E:\the hencolle games\styles.css" "E:\the hencolle games\app.js" "E:\the hencolle games\events.js" "E:\the hencolle games\hencolle-icon.png" "E:\the hencolle games\serve.js" "E:\the hencolle games\ecosystem.config.cjs" root@YOUR_IONOS_SERVER_IP:/var/www/hencollegames/
```
