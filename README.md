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

- `ember serve --proxy http://check-in/api` where `http://check-in/api` is the URL to access the database/web server. See [Deploying](#Deploying) for instructions on creating a pod hosting the database server.
- Visit your app at [http://localhost:4200](http://localhost:4200).
- Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Running Tests

- `npm run test`
- `npm run test:ember -- --server`

### Linting

- `npm run lint`
- `npm run lint:fix`

### Building
****
- `npm exec ember build` (development)
- `npm run build` (production)

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
The application is deployed as a Podman pod. After cloning the repo, change to the `pod` directory and run `sudo ./buildpod.sh`. This will download and configure the 4 containers in the pod to run the application.

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
