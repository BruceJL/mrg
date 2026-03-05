# mrg-sign-in

This README outlines the details of collaborating on this Ember application.
A short introduction of this app could easily go here.

## Prerequisites

You will need the following things properly installed on your computer.

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (with npm)
- [Ember CLI](https://cli.emberjs.com/release/)
- [Google Chrome](https://google.com/chrome/)

## Installation

- `git clone <repository-url>` this repository
- `cd mrg-sign-in`
- `npm install`

## Running / Development

- `npm start -- --proxy http://check-in/ --secure-proxy false` where `http://check-in/` is the URL to access the database/web server. Note that the pod is created with a self-signed certificate, and that `--secure-proxy false` will allow the development environment to attach without issue. See [Deploying](#Deploying) for instructions on creating a pod hosting the database server.
- Visit your app at [http://localhost:4200](http://localhost:4200).
- Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Deploying
The application is best hosted on dedicated hardware for the purposes of managing information at the Manitoba Robot Games. It's reccomended that a standalone computer be purposed as the check-in server (unless you really know what you're doing). Instructions on how to do so are listed below.

#### Server hardware
The program is currently running on a Toshiba Satellite A200 (circa 2007) without issue. This is fine given that no GUI is installed and the computer has a solid state disk. Current disk space usage is about 80GB (But this probably could be cut down significantly with a fresh install).

#### Installation of the Server OS.
The application is best deployed on a debian stable (or occasionally testing) environment. If using low-powered or obsolete hardware, Install debian with only the base install and the following packages
  - openssh-server (or 'SSH server' using tasksel)
  - podman
  - pwgen
  - git
  - dnsmasq
  - sudo

Which can be installed using apt: `sudo  apt install openssh-server podman pwgen git dnsmasq`.

#### Creation of the Pod
The application is deployed as a Podman pod. After cloning the repo, change to the `pod` directory and run `sudo ./rebuild.sh`. This will download and configure the 4 containers in the pod to run the application. It will also copy the quadlet files to the `/etc/containers/systemd/` directory, and run the `systemctl daemon-reexec` and `systemctl daemon-reload` and then start the pod using the `systemctl start mrg-check-in-pod`


The containers created are:
* **PostgreSQL** - Hosts the database containing all the competition information. It also includes a number of scripts to run business logic on the database. A default database schema is automatically installed.
* **Postgrest** - Provides a RESTful interface into the PostgreSQL database.
* **Python/Flask** - Provides a python environment for generating documents (as libreoffice/PDF files) as well as other business logic not suited for execution natively in PostgreSQL (e.g. slotting of competitors in round robin tournaments.)
* **Nginx** - Serves the web files, as well as provides a reverse proxy for the Postgrest and Flask daemons.

#### Configuration of the Network Interfaces
TODO - Add stuff to do with DHCP and DNS (dnsmasq) functionality and network setup.

#### Importing of data from GravityForms into the PostgreSQL database.
Before the games, it is necessary to competitor registration data from the data collected by Gravityforms into the database. This is most easily accomplished with the Dbeaver tool.

TODO - flesh out how to import the data.

## Further Reading / Useful Links

- [podman](https://podman.io/)
- [nginx](https://nginx.org/en/)
- [Postgrest](https://postgrest.org)
- [PostgreSQL](https://www.postgresql.org/)
- [Dbeaver](https://dbeaver.io/)
- [ember.js](https://emberjs.com/)
- [ember-cli](https://cli.emberjs.com/release/)
- Development Browser Extensions
  - [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  - [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

### Mac Development Setup (UTM)

On macOS, the server pod can be run inside a Debian 12 VM using [UTM](https://mac.getutm.app/). The Ember frontend runs natively on the Mac and proxies API requests to the VM.

#### 1. Create the Debian VM

1. Download and install [UTM](https://mac.getutm.app/).
2. Download a [Debian 12 (Bookworm) ISO](https://mac.getutm.app/gallery/debian-12).
3. Create a new VM in UTM using the Debian ISO. A minimal install with SSH server is sufficient.
4. Under the VM's settings, add this repository as a shared directory (it will be accessible at `/media/share` inside the VM).
5. Boot the VM and verify the shared directory is mounted:
   ```bash
   ls /media/share
   ```

#### 2. Install dependencies inside the VM

```bash
sudo apt-get update
sudo apt-get install -y podman pwgen git
```

> **Note:** Debian 12 ships Podman 4.3, which does not support quadlets (requires >= 4.4). To upgrade Podman, add the Debian Trixie repo with low priority pinning:
> ```bash
> echo 'deb http://deb.debian.org/debian trixie main' | sudo tee /etc/apt/sources.list.d/trixie.list
> echo -e 'Package: *\nPin: release n=trixie\nPin-Priority: 100' | sudo tee /etc/apt/preferences.d/trixie
> sudo apt-get update
> sudo apt-get -t trixie install -y podman crun
> ```

#### 3. Build and start the pod

```bash
cd /media/share/pod
chmod +x rebuild.sh
sudo ./rebuild.sh
```

Verify all containers are running:
```bash
sudo podman ps -a
```

#### 4. Install Node.js on the Mac (host)

Install [nvm](https://github.com/nvm-sh/nvm) and Node.js on your Mac for running the Ember frontend:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
\. "$HOME/.nvm/nvm.sh"
nvm install 24
```

#### 5. Run the Ember frontend on the Mac

```bash
cd /path/to/mrg
npm install
npm start -- --proxy https://<vm-ip-address>/ --secure-proxy false
```

Replace `<vm-ip-address>` with the IP of the Debian VM (find it with `ip addr` inside the VM). The `--secure-proxy false` flag is needed because the pod uses a self-signed certificate.

Visit the app at [http://localhost:4200](http://localhost:4200).