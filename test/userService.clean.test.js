const { UserService } = require('../src/userService');

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  describe('createUser', () => {
    test('retorna o usuário criado com id gerado e os dados informados', () => {
      // Arrange
      const nome = 'Fulano de Tal';
      const email = 'fulano@teste.com';
      const idade = 25;

      // Act
      const usuario = userService.createUser(nome, email, idade);

      // Assert
      expect(usuario.id).toEqual(expect.any(String));
      expect(usuario).toMatchObject({ nome, email, idade });
    });

    test('cria o usuário com status ativo e sem privilégio de admin por padrão', () => {
      // Arrange
      const idade = 30;

      // Act
      const usuario = userService.createUser('Comum', 'comum@teste.com', idade);

      // Assert
      expect(usuario.status).toBe('ativo');
      expect(usuario.isAdmin).toBe(false);
    });

    test('lança erro ao criar usuário menor de idade', () => {
      // Arrange
      const idadeMenor = 17;

      // Act
      const criarMenor = () => userService.createUser('Menor', 'menor@email.com', idadeMenor);

      // Assert
      expect(criarMenor).toThrow('O usuário deve ser maior de idade.');
    });

    test.each([
      ['nome', undefined, 'sem.nome@email.com', 20],
      ['email', 'Sem Email', undefined, 20],
      ['idade', 'Sem Idade', 'sem.idade@email.com', undefined],
    ])('lança erro quando o campo obrigatório "%s" não é informado', (_campo, nome, email, idade) => {
      // Arrange
      const criarIncompleto = () => userService.createUser(nome, email, idade);

      // Act & Assert
      expect(criarIncompleto).toThrow('Nome, email e idade são obrigatórios.');
    });
  });

  describe('getUserById', () => {
    test('retorna o usuário previamente criado a partir do seu id', () => {
      // Arrange
      const usuarioCriado = userService.createUser('Fulano de Tal', 'fulano@teste.com', 25);

      // Act
      const usuarioBuscado = userService.getUserById(usuarioCriado.id);

      // Assert
      expect(usuarioBuscado).toEqual(usuarioCriado);
    });

    test('retorna null quando o id não existe', () => {
      // Arrange
      const idInexistente = 'id-que-nao-existe';

      // Act
      const resultado = userService.getUserById(idInexistente);

      // Assert
      expect(resultado).toBeNull();
    });
  });

  describe('deactivateUser', () => {
    test('retorna true ao desativar um usuário comum', () => {
      // Arrange
      const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

      // Act
      const resultado = userService.deactivateUser(usuarioComum.id);

      // Assert
      expect(resultado).toBe(true);
    });

    test('altera o status do usuário comum para inativo', () => {
      // Arrange
      const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

      // Act
      userService.deactivateUser(usuarioComum.id);

      // Assert
      expect(userService.getUserById(usuarioComum.id).status).toBe('inativo');
    });

    test('retorna false e mantém ativo um usuário administrador', () => {
      // Arrange
      const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      // Act
      const resultado = userService.deactivateUser(usuarioAdmin.id);

      // Assert
      expect(resultado).toBe(false);
      expect(userService.getUserById(usuarioAdmin.id).status).toBe('ativo');
    });

    test('retorna false quando o usuário não existe', () => {
      // Arrange
      const idInexistente = 'id-que-nao-existe';

      // Act
      const resultado = userService.deactivateUser(idInexistente);

      // Assert
      expect(resultado).toBe(false);
    });
  });

  describe('generateUserReport', () => {
    test('inclui id, nome e status de cada usuário cadastrado', () => {
      // Arrange
      const alice = userService.createUser('Alice', 'alice@email.com', 28);
      const bob = userService.createUser('Bob', 'bob@email.com', 32);
      userService.deactivateUser(bob.id);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain(alice.id);
      expect(relatorio).toContain('Alice');
      expect(relatorio).toContain(bob.id);
      expect(relatorio).toContain('Bob');
      expect(relatorio).toContain('inativo');
    });

    test('informa que não há usuários quando nenhum foi cadastrado', () => {
      // Arrange: nenhum usuário é criado (o banco é limpo no beforeEach)

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('Nenhum usuário cadastrado');
    });
  });
});
