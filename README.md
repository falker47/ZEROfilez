# 🔐 ZEROfilez Cloud Decryptor

Sistema personale per gestire file criptati su GitHub con crittografia client-side.

## 📋 Panoramica

ZEROfilez Cloud Decryptor è un sistema che ti permette di:
- Criptare file localmente con chiavi personalizzate
- Caricare solo i file criptati su GitHub
- Gestire una lista centralizzata dei tuoi file tramite web app
- Scaricare e decriptare automaticamente i file dal browser

**🔒 Tutta la crittografia avviene localmente** - nessun dato sensibile viene mai inviato a server esterni.

## 🚀 Setup Rapido

1. **Installa dipendenze**: `pip install cryptography`
2. **Configura GitHub Pages** nel tuo repository
3. **Segui le istruzioni** per configurare le chiavi di crittografia

## 📁 Struttura del Progetto

```
├── index.html              # Web app principale
├── styles.css              # Stili CSS
├── script.js               # Logica JavaScript
├── add_file_and_update_package.py  # Script Python per aggiungere file
├── packages.json.enc        # File criptato con lista dei file
├── blobs/                  # File criptati (.enc)
├── originals/              # File originali
└── README.md               # Questa documentazione
```

## 🔧 Utilizzo Base

### Aggiungere un File
1. Metti il file nella cartella `originals/`
2. Esegui lo script Python con le tue chiavi
3. Carica il file criptato su GitHub
4. Inserisci l'URL quando richiesto

### Utilizzare la Web App
1. Apri GitHub Pages del repository
2. Inserisci la tua user key
3. Carica il file `packages.json.enc`
4. Scarica i file dalla lista

## 🧪 Test

È incluso un file di esempio `originals/hello.txt` per testare il sistema.

## 📄 Licenza

Questo progetto è per uso personale. Tutti i file sono forniti "così come sono" senza garanzie.

---

**⚠️ IMPORTANTE**: 
- Mantieni sempre backup delle tue chiavi
- Non condividere mai le tue user key
- Testa sempre il sistema con file di prova prima di usarlo per dati importanti
