const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const importSampleDataToUniversal = async () => {
  const connection = await mysql.createConnection({
    host: '127.0.0.1', // Force IPv4
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bmw_datagrid'
  });

  try {
    // Check if there's any existing data to import
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Available tables:', tables.map(t => Object.values(t)[0]));

    // Clear existing universal data
    await connection.execute('DELETE FROM universal_data');
    console.log('Cleared existing universal data');

    // Import sample data if available
    const sampleData = [
      {
        id: uuidv4(),
        data: {
          Name: 'John Doe',
          Email: 'john@example.com',
          Department: 'Engineering',
          Salary: 75000,
          StartDate: '2023-01-15'
        },
        added_by: '1b20bd056d799bf6f3fecb14e97c1982'
      },
      {
        id: uuidv4(),
        data: {
          Name: 'Jane Smith',
          Email: 'jane@example.com',
          Department: 'Marketing',
          Salary: 65000,
          StartDate: '2023-02-20'
        },
        added_by: '1b20bd056d799bf6f3fecb14e97c1982'
      },
      {
        id: uuidv4(),
        data: {
          Name: 'Mike Johnson',
          Email: 'mike@example.com',
          Department: 'Sales',
          Salary: 70000,
          StartDate: '2023-03-10'
        },
        added_by: '1b20bd056d799bf6f3fecb14e97c1982'
      }
    ];

    for (const record of sampleData) {
      await connection.execute(
        'INSERT INTO universal_data (id, data, added_by, created_at) VALUES (?, ?, ?, ?)',
        [record.id, JSON.stringify(record.data), record.added_by, new Date()]
      );
    }

    console.log(`✅ Successfully imported ${sampleData.length} sample records to universal_data table`);
  } catch (error) {
    console.error('❌ Error importing sample data to universal data:', error);
  } finally {
    await connection.end();
  }
};

importSampleDataToUniversal(); 