// Skrypt seedujący quiz do bazy jeśli nie istnieje
const { Quiz } = require('./src/models');
const sequelize = require('./src/config/database');

async function seedQuiz() {
  await sequelize.sync();
  // Jeśli nie istnieje żaden quiz, utwórz domyślny pusty quiz
  const count = await Quiz.count();
  if (count === 0) {
    await Quiz.create({
      title: 'Quiz psychologiczny',
      description: 'Quiz do dopasowywania terapeutów na podstawie odpowiedzi.'
    });
    console.log('Pusty quiz został utworzony.');
  } else {
    console.log('Quiz już istnieje.');
  }
  process.exit(0);
}

seedQuiz().catch(e => { console.error(e); process.exit(1); });
