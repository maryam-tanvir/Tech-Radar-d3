const getTableData = async (req, res, db) => {
    try {
        const results = await db.raw(`
        SELECT 
          l.leads_id AS lead_id,
          l.stock_name AS lead_name,
          ua.corp_id,
          p.battle_date,
          p.profit_and_loss,
          u.unit_id,
          u.unit_name
        FROM 
          leads l
        JOIN 
          performance p ON l.leads_id = p.lead_id
        JOIN 
          unit_assignment ua ON p.unit_assignment_id = ua.unit_assignment_id
        JOIN 
          unit u ON ua.unit_id = u.unit_id
        ORDER BY 
          l.leads_id;
      `);
        res.json(results.rows);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Server error');
    }
};

const postTableData = (req, res, db) => {
    // Your logic for POST request
};

const putTableData = (req, res, db) => {
    // Your logic for PUT request
};

const deleteTableData = (req, res, db) => {
    // Your logic for DELETE request
};

module.exports = {
    getTableData,
    postTableData,
    putTableData,
    deleteTableData,
};
