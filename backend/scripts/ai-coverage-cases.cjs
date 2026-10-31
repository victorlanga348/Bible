// Frozen against the authentic paragraphs before S10-T004 inference.
// Only question and actual studyVersion reach the API; expected spans stay here.
const cases = Object.freeze([
  { id: 'E01', reference: 'GEN 1:3-5', paragraph: 1, question: 'Segundo Josefo, como se chamam a luz e a escuridão?', sentenceId: 'p1-s2', start: 55, end: 499 },
  { id: 'E02', reference: 'GEN 2:8-9', paragraph: 3, question: 'Segundo Josefo, onde foi plantado o paraíso?', sentenceId: 'p3-s1', start: 0, end: 320 },
  { id: 'E03', reference: 'GEN 2:21-22', paragraph: 2, question: 'Segundo Josefo, como foi formada a mulher?', sentenceId: 'p2-s4', start: 584, end: 934 },
  { id: 'E04', reference: 'GEN 3:6', paragraph: 4, question: 'Segundo Josefo, quem persuadiu Adão a provar o fruto?', sentenceId: 'p4-s3', start: 893, end: 1005 },
  { id: 'E05', reference: 'GEN 1:3-5', paragraph: 1, question: 'Qual é a data arqueológica independente da criação, demonstrada por estes excertos?', sentenceId: null },
].map(row => Object.freeze(row)));
module.exports = { cases };
