const prompts = require('prompts');

function Question() { }

Question.on = function on(questionList) {
  return new Promise((resolve) => {
    const answer = prompts(questionList);
    resolve(answer);
  });
};

module.exports = Question;
