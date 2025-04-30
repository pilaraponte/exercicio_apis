import express from 'express';

const app = express();

let alunos = [];

app.use(express.json());

app.post('/alunos', (req, res) => {
    const { nome, matricula, status } = req.body;
    const dataCriacao = new Date();

    if (!nome) {
        return res.status(400).json({ erro: `O campo 'nome' é obrigatório.` });
    }

    if (!matricula) {
        return res.status(400).json({ erro: `O campo 'matricula' é obrigatório.` });
    }

    if (!status) {
        return res.status(400).json({ erro: `O campo 'status' é obrigatório.` });
    }

    if (status !== 'ativo' && status !== 'inativo') {
        return res.status(400).json({ erro: `O campo 'status' deve ser 'ativo' ou 'inativo.` });
    }

    if (nome.length < 3) {
        return res.status(400).json({ erro: 'O nome deve conter pelo menos 3 caracteres.' });
    }

    const matriculaExiste = alunos.some(aluno => aluno.matricula.toLowerCase() === matricula.toLowerCase());
    if (matriculaExiste) {
        return res.status(409).json({ erro: 'Já existe um aluno com essa matrícula.' });
    }

    const novoAluno = {
        nome,
        matricula,
        status,
        dataCriacao
    };

    alunos.push(novoAluno);

    res.status(201).json({ mensagem: "Aluno cadastrado com sucesso." });
});

app.post('/alunos/:matricula/notas', (req, res) => {
    const { matricula } = req.params;
    const { notas } = req.body;
    const dataAlteracao = new Date();

    const aluno = alunos.find(aluno => aluno.matricula === matricula);
    if (!aluno) {
        return res.status(404).json({ erro: "Aluno não encontrado." });
    }

    if (aluno.status === "inativo") {
        return res.status(403).json({ erro: "Não é possível cadastrar notas para alunos inativos." });
    }

    if (!notas || !Array.isArray(notas)) {
        return res.status(400).json({ erro: "O campo 'notas' é obrigatório e deve ser um array de 4 números." });
    }

    if (notas.length !== 4) {
        return res.status(400).json({ erro: "Devem ser fornecidas exatamente 4 notas." });
    }

    const notasValidas = notas.every(nota => typeof nota === 'number' && nota >= 0 && nota <= 10);
    if (!notasValidas) {
        return res.status(400).json({ erro: 'Todas as notas devem ser números entre 0 e 10.' });
    }

    aluno.notas = notas;
    aluno.dataAlteracao = dataAlteracao;

    res.status(200).json({ mensagem: "Notas cadastradas com sucesso." });
});

app.delete('/alunos/:matricula', (req, res) => {
    const { matricula } = req.params;

    const aluno = alunos.find(aluno => aluno.matricula === matricula);
    if (!aluno) {
        return res.status(404).json({ erro: 'Aluno não encontrado.' });
    }

    aluno.status = 'inativo';

    res.status(200).json({ mensagem: 'Aluno inativado com sucesso.' });
});

app.get('/alunos', (req, res) => {
    const { status } = req.query;

    if (alunos.length === 0) {
        return res.status(404).json({ erro: "Não existem alunos cadastrados!" });
    }

    let resultado = alunos;

    if (status) {
        resultado = resultado.filter(aluno => aluno.status === status);
    }

    if (resultado.length === 0) {
        return res.status(404).json({ erro: "Nenhum aluno encontrado com o status informado." });
    }

    const resposta = resultado.map(aluno => ({
        nome: aluno.nome,
        matricula: aluno.matricula,
        status: aluno.status,
        dataCriacao: aluno.dataCriacao
    }));

    return res.status(200).json(resposta);
});

app.get('/alunos/:matricula', (req, res) => {
    const { matricula } = req.params;

    const aluno = alunos.find(aluno => aluno.matricula === matricula);
    if (!aluno) {
        return res.status(404).json({ erro: 'Aluno não encontrado.' });
    }

    if (!aluno.notas || aluno.notas.length !== 4) {
        return res.status(200).json({
            nome: aluno.nome,
            matricula: aluno.matricula,
            status: aluno.status,
            dataCriacao: aluno.dataCriacao,
            dataAlteracao: aluno.dataAlteracao || null
        });
    }

    const somaNotas = aluno.notas.reduce((acc, nota) => acc + nota, 0);
    const media = somaNotas / aluno.notas.length;

    let situacaoAluno = '';
    if (media >= 7) situacaoAluno = 'aprovado';
    else if (media >= 5) situacaoAluno = 'recuperacao';
    else situacaoAluno = 'reprovado';

    return res.status(200).json({
        nome: aluno.nome,
        matricula: aluno.matricula,
        status: aluno.status,
        notas: aluno.notas,
        media: Number(media.toFixed(2)),
        situacao: situacaoAluno,
        dataCriacao: aluno.dataCriacao,
        dataAlteracao: aluno.dataAlteracao
    });
});

app.get('/alunos/notas', (req, res) => {
    const resultado = alunos
        .filter(aluno => Array.isArray(aluno.notas))
        .map(aluno => {
            const media = aluno.notas.reduce((a, b) => a + b, 0) / aluno.notas.length;
            let situacao = '';
            if (media >= 7) situacao = 'aprovado';
            else if (media >= 5) situacao = 'recuperacao';
            else situacao = 'reprovado';

            return {
                nome: aluno.nome,
                matricula: aluno.matricula,
                notas: aluno.notas,
                media: Number(media.toFixed(2)),
                situacao
            };
        });

    res.status(200).json(resultado);
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
