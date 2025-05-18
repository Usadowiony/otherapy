// Skrypt seedujący quiz do bazy jeśli nie istnieje
const { Quiz } = require('./src/models');
const sequelize = require('./src/config/database');

async function seedQuiz() {
  await sequelize.sync();
  const [quiz, created] = await Quiz.findOrCreate({
    where: { title: 'Quiz psychologiczny' },
    defaults: {
      title: 'Quiz psychologiczny',
      description: 'Quiz do dopasowywania terapeutów na podstawie odpowiedzi.'
    }
  });
  if (created) {
    console.log('Quiz został utworzony.');
  } else {
    console.log('Quiz już istnieje.');
  }
  process.exit(0);
}

seedQuiz().catch(e => { console.error(e); process.exit(1); });
