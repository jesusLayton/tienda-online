require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const env = require('./config/env');

const PORT = env.PORT;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📦 API disponible en http://localhost:${PORT}/api/v1`);
      console.log(`🌍 Entorno: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error.message);
    process.exit(1);
  }
};

startServer();
