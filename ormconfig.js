module.exports = {
  name: 'default',
  type: process.env.DB_TYPE,
  host: 'localhost',
  port: 1433,
  logging: true,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: true,
  entities: ['src/entities/*.*']
}
