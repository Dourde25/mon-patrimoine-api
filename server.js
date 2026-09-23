const express = require('express');
const cors = require('cors');
const YahooFinance = require('yahoo-finance2').default;

const yahooFinance = new YahooFinance();
const app = express();
app.use(cors());

// Structuration du portefeuille par catégorie
const monPortefeuille = {
    crypto: [
        { ticker: 'BTC-EUR', quantite: 0.002765 },
        { ticker: 'XRP-EUR', quantite: 33.361768 }
    ],
    etf: [
        { ticker: 'SXR8.DE', quantite: 1.762089 },
        { ticker: 'EUNL.DE', quantite: 7.884626 }
    ],
    actions: [
        { ticker: 'AAPL', quantite: 1.121209 },
        { ticker: 'MBR.WA', quantite: 0.782747 },
        { ticker: 'TTWO', quantite: 0.246002 },
        { ticker: 'PYPL', quantite: 0.688705 },
        { ticker: 'TSLA', quantite: 0.0794 },
        { ticker: 'SPCE', quantite: 1.973781 }
    ]
};

async function calculerCategorie(liste) {
    let totalCat = 0;
    for (const item of liste) {
        try {
            const result = await yahooFinance.quote(item.ticker);
            let prix = result.regularMarketPrice || 0;

            if (result.currency === 'USD') {
                const usdEur = await yahooFinance.quote('EURUSD=X');
                prix = prix / (usdEur.regularMarketPrice || 1);
            } else if (result.currency === 'PLN') {
                const plnEur = await yahooFinance.quote('EURPLN=X');
                prix = prix / (plnEur.regularMarketPrice || 1);
            }

            totalCat += prix * item.quantite;
        } catch (err) {
            console.log(`Erreur sur ${item.ticker} :`, err.message);
        }
    }
    return Math.round(totalCat);
}

app.get('/api/bourse', async (req, res) => {
    const totalCrypto = await calculerCategorie(monPortefeuille.crypto);
    const totalEtf = await calculerCategorie(monPortefeuille.etf);
    const totalActions = await calculerCategorie(monPortefeuille.actions);
    const totalGeneral = totalCrypto + totalEtf + totalActions;

    res.json({
        total: totalGeneral,
        details: {
            crypto: totalCrypto,
            etf: totalEtf,
            actions: totalActions
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Connexion prête sur le port ${PORT} !`));