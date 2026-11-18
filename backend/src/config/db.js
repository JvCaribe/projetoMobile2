// Conexao com o banco de dados MySQL.
// Usamos um "pool" de conexoes: o mysql2 mantem algumas conexoes abertas
// e reaproveita entre as requisicoes, o que e mais rapido do que abrir
// uma conexao nova a cada pedido.
const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  charset: 'utf8mb4', // suporte completo a acentos
  // Faz o MySQL devolver datas como texto ("2026-09-21") em vez de objeto Date.
  // Assim evitamos problemas de fuso horario (a data "voltar" um dia).
  dateStrings: true,
});

module.exports = db;
