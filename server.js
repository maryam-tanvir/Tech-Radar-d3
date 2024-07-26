const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const knex = require('knex');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Express Middleware
app.use(cors({
    credentials: true,
    origin: ["http://localhost:5000"]
}));
app.use(bodyParser.json());
app.use(morgan('combined'));

// Database Connection
const db = knex({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
});

// Controllers - aka, the db queries
const main = require('./src/components/main');

// App Routes - Auth
app.get('/api/data', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.performance_id,
                p.unit_assignment_id,
                p.profit_and_loss AS performance_profit_and_loss,
                d.start_date,
                d.end_date,
                d.status,
                l.leads_id
            FROM 
                performance p
            LEFT JOIN 
                deployment d ON p.unit_assignment_id = d.unit_assignment_id
            LEFT JOIN 
                allocation a ON d.deployment_id = a.deployment_id
            LEFT JOIN 
                leads l ON d.lead_id = l.leads_id;
        `;

        const data = await db.raw(query);
        
        // Log the raw data for debugging
        console.log('Raw data:', data);

        // Format data for frontend
        const formattedData = data.rows.map(row => ({
            performance_id: row.performance_id,
            unit_assignment_id: row.unit_assignment_id,
            performance_profit_and_loss: row.performance_profit_and_loss,
            start_date: row.start_date,
            end_date: row.end_date,
            status: row.status,
            quadrant: row.leads_id, // Assuming leads_id determines the quadrant
            color: row.performance_profit_and_loss >= 0 ? 'green' : 'red' // Green for profit, red for loss
        }));

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// App Server Connection
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
