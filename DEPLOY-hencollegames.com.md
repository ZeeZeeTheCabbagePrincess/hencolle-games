# Deploy `hencollegames.com` on a VPS

This project is a static website. In production, you only need to serve the files with Nginx.

## Files to upload

From `E:\the hencolle games\`, upload:

- `index.html`
- `styles.css`
- `app.js`
- `events.js`
- `hencolle-icon.png`

Recommended target directory on the VPS:

```bash
/var/www/hencollegames.com
```

## Ubuntu + Nginx setup

```bash
sudo apt update
sudo apt install -y nginx
sudo mkdir -p /var/www/hencollegames.com
sudo chown -R $USER:$USER /var/www/hencollegames.com
```

Copy the site files into `/var/www/hencollegames.com`.

## Nginx config

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

    root /var/www/hencollegames.com;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/hencollegames.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## DNS

At your DNS provider, point these records to your VPS IP:

- `A` record for `hencollegames.com`
- `A` record for `www.hencollegames.com`

## HTTPS

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d hencollegames.com -d www.hencollegames.com
```

## Updating later

Whenever you change the site locally, re-upload:

- `index.html`
- `styles.css`
- `app.js`
- `events.js`
- `hencolle-icon.png`

Nginx does not need a restart for normal static-file updates.

## Optional upload command from Windows PowerShell

```powershell
scp "E:\the hencolle games\index.html" "E:\the hencolle games\styles.css" "E:\the hencolle games\app.js" "E:\the hencolle games\events.js" "E:\the hencolle games\hencolle-icon.png" user@YOUR_VPS_IP:/var/www/hencollegames.com/
```
