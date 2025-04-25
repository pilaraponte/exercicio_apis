import express from 'express';

const app = express();

const alunos = [];


app.use(express.json());

app.get('/alunos', (req, res) => {
    res.json(alunos);
});

app.post('/alunos', (req, res) => {
    const { nome, matricula, status } = req.body;

    if (!nome || !matricula || !status) {
        return res.status(400).json({ erro: 'Nome, matrícula e status são obrigatórios.' });
    }

    if (status !== 'ativo' && status !== 'inativo') {
        return res.status(400).json({ erro: 'Status deve ser "ativo" ou "inativo".' });
    }

    const matriculaExiste = alunos.some(aluno => aluno.matricula === matricula);
    if (matriculaExiste) {
        return res.status(400).json({ erro: 'Matrícula já cadastrada.' });
    }

    const numerosId = alunos.map(aluno => aluno.id);
    const id = numerosId.length ? Math.max(...numerosId) + 1 : 1;

    const novoAluno = {
        id,
        nome,
        matricula,
        status
    };

    alunos.push(novoAluno);

    res.status(201).json(novoAluno);
});



app.post('/alunos/:matricula/notas', (req, res) => {
    const { matricula } = req.params;
    const { notas } = req.body;

    const aluno = alunos.find(aluno => aluno.matricula === matricula);
    if (!aluno) {
        return res.status(404).json({ erro: 'Aluno não encontrado.' });
    }

    if (!Array.isArray(notas) || notas.length !== 4) {
        return res.status(400).json({ erro: 'É necessário informar exatamente 4 notas.' });
    }

    const notasValidas = notas.every(nota => typeof nota === 'number' && nota >= 0 && nota <= 10);
    if (!notasValidas) {
        return res.status(400).json({ erro: 'Todas as notas devem ser números entre 0 e 10.' });
    }

    aluno.notas = notas;

    res.status(200).json({ mensagem: 'Notas atualizadas com sucesso.', aluno });
});

app.get('/alunos/:matricula/notas', (req, res) => {
    const { matricula } = req.params;

    const aluno = alunos.find(aluno => aluno.matricula === matricula);

    if (!aluno) {
        return res.status(404).json({ erro: 'Aluno não encontrado.' });
    }

    if (!aluno.notas) {
        return res.status(404).json({ erro: 'Notas não cadastradas para este aluno.' });
    }

    res.status(200).json({ notas: aluno.notas });
});

app.delete('/alunos/:idAluno', (req, res) => {
    const { idAluno } = req.params;

    const alunoExistente = alunos.find(aluno => aluno.id == idAluno);

    if (!alunoExistente) {
        return res.status(404).json({ erro: 'Aluno não encontrado.' });
    }

    alunos = alunos.filter(aluno => aluno.id != idAluno);

    res.json({ mensagem: 'Aluno deletado com sucesso!' });
});


app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
  });
  

