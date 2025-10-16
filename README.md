# 🔐 ZEROfilez Cloud Decryptor

Sistema personale per gestire file criptati su GitHub con crittografia client-side.

## 📋 Panoramica

ZEROfilez Cloud Decryptor è un sistema che ti permette di:
- Criptare file localmente con chiavi personalizzate
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
└── README.md               # Questa documentazione
```

## 📄 Licenza

Questo progetto è per uso personale per motivi di privacy nascondo i miei script per criptare ma siete liberi di usare questo codice a vostro piacimento ed implementare le vostre tecniche crittografiche.

---

**⚠️ IMPORTANTE**: 
- Mantieni sempre backup delle tue chiavi
- Non condividere mai le tue user key
- Testa sempre il sistema con file di prova prima di usarlo per dati importanti
