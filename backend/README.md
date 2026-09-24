# Stargate Warfare: Galactic MMORPG - MySQL & phpMyAdmin System

This directory contains the background database schema, configuration system, installer, and worker cron scripts for **Universe Civilization & Stargate Warfare**.

Compatible with:
- **MySQL 5.7+ / 8.0+**
- **MariaDB 10.3+ / 10.11+**
- **phpMyAdmin 4.9+ / 5.2+**
- **PHP 7.4 / 8.0 / 8.1 / 8.2 / 8.3**
- Standard stacks: **XAMPP**, **WAMP**, **Laragon**, **LAMP**, **Docker**, **cPanel**

---

## Directory Structure

```text
├── database.sql                  <- Master phpMyAdmin SQL dump file (1-click importable)
├── install.php                   <- Automated database installer & integrity verifier
├── config/
│   ├── config.php                <- Global configuration (database credentials, rules, security)
│   ├── database.php              <- PDO Singleton database abstraction class
│   └── phpmyadmin_config.php     <- phpMyAdmin config.inc.php snippet & tuning
└── cron/
    └── turn_worker.php           <- Background turn generator and mine production engine
```

---

## 1. Quick Import in phpMyAdmin (1-Click)

1. Open your browser and navigate to phpMyAdmin (e.g. `http://localhost/phpmyadmin/`).
2. Click on the **Import** tab at the top.
3. Click **Browse / Choose File** and select `backend/database.sql` (or `database.sql` in the project root).
4. Leave format as **SQL** and character set as **utf-8**.
5. Click **Import** (or **Go**).
6. phpMyAdmin will create the database `stargate_universe_db` and all 16 relational tables with sample universe seed data!

---

## 2. Automated Installer via CLI or Web

You can also run the automated installer:

### Via Terminal:
```bash
php backend/install.php
```

### Via Browser:
Navigate to:
```text
http://localhost/backend/install.php
```
The script will:
- Connect to MySQL.
- Create `stargate_universe_db` if it doesn't exist.
- Run `database.sql`.
- Verify all table schemas, primary keys, and seed rows.

---

## 3. Database Schema Overview (16 Relational Tables)

| Table Name | Description | Key Relationships |
|---|---|---|
| `game_config` | Turn rates, miner yields, server settings | Standalone |
| `users` | Player accounts, commander rank, faction | Primary Entity |
| `user_resources` | Stockpiles of Naquadah, crystal, trinium, energy | FK -> `users.id` |
| `user_military_units` | Attack troops, defense guards, miners, spies | FK -> `users.id` |
| `naval_shipyard_ships` | F-302s, BC-304 Daedalus, Ha'tak motherships | FK -> `users.id` |
| `stargate_relics_inventory`| ZPMs, Asgard Cores, Dakara Wave Arrays | FK -> `users.id` |
| `colonies_planets` | Planetary worlds, mines, solar plants | FK -> `users.id` |
| `defense_structures` | Rocket launchers, shield domes, ion turrets | FK -> `colonies_planets.id` |
| `research_technology` | Espionage tech, hyperdrive, weapons tech | FK -> `users.id` |
| `alliances` | Galactic federations & coalitions | FK -> `users.id` (founder) |
| `alliance_members` | Alliance roster and officer permissions | FK -> `alliances.id`, `users.id` |
| `combat_battle_logs` | Warfare reports, fleet losses, debris fields | FK -> `users.id` |
| `espionage_missions` | Phase-cloak covert operations reports | FK -> `users.id` |
| `marketplace_orders` | Galactic bazaar trades and ore transactions | FK -> `users.id` |
| `cron_job_queue` | Background scheduler tasks and run history | Standalone |
| `admin_audit_logs` | Imperial decrees and security audit trail | FK -> `users.id` |

---

## 4. Scheduling Galactic Ticks (Cron Job)

To run the game's background turn and production engine every minute, add this entry to your crontab:

```bash
crontab -e
```

Add line:
```cron
* * * * * /usr/bin/php /path/to/stargate-warfare/backend/cron/turn_worker.php >> /var/log/stargate_turns.log 2>&1
```

---

## 5. Connecting phpMyAdmin in Docker (Optional)

If running MySQL and phpMyAdmin in Docker:

```yaml
version: '3.8'
services:
  mysql:
    image: mariadb:10.11
    container_name: stargate_mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: stargate_universe_db
    ports:
      - "3306:3306"
    volumes:
      - ./backend/database.sql:/docker-entrypoint-initdb.d/init.sql

  phpmyadmin:
    image: phpmyadmin:latest
    container_name: stargate_phpmyadmin
    environment:
      PMA_HOST: mysql
      PMA_PORT: 3306
    ports:
      - "8080:80"
    depends_on:
      - mysql
```
Then access phpMyAdmin at `http://localhost:8080/`.
