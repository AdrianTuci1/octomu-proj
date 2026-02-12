# Cum să instalezi și să folosești Octomus Local

Octomus Local este conceput să fie extrem de simplu de instalat și rulat, fie pe laptopul tău personal, fie pe un server VPS.

## 1. Cerințe Preliminare (Prerequisites)

Deoarece instalarea compilează aplicația direct pe mașina ta, ai nevoie de următoarele instalate:
- **Go** (pentru backend)
- **Node.js & npm** (pentru frontend)
- **Git** (pentru a descărca codul)

Scriptul de instalare va verifica aceste dependențe și te va anunța dacă lipsește ceva.

## 2. Instalare Rapidă

```bash
curl -fsSL https://get.octomus.dev/install.sh | bash
```

Acest script va instala comanda `octomus` în sistemul tău.

---

## 3. Utilizare

### Comenzi Disponibile

- **Start (Local)**:
  ```bash
  octomus start
  ```
- **Start (Secure - VPS)**:
  ```bash
  octomus start --secure
  ```
- **Actualizare**:
  ```bash
  octomus update
  ```
- **Dezinstalare**:
  ```bash
  octomus remove
  ```
  *Această comandă va șterge aplicația și te va întreba dacă vrei să ștergi și datele persistente.*

---

## 4. Configurare Avansată

### Variabile de Mediu
- `OCTOMUS_AUTH=true`: Activează autentificarea.
- `PORT=8080`: Portul pe care rulează serverul.

