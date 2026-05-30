import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.page.deleteMany()
  await prisma.ban.deleteMany()
  await prisma.playerDeath.deleteMany()
  await prisma.playerKiller.deleteMany()
  await prisma.playerSkill.deleteMany()
  await prisma.guildMember.deleteMany()
  await prisma.guildRank.deleteMany()
  await prisma.guild.deleteMany()
  await prisma.player.deleteMany()
  await prisma.account.deleteMany()
  await prisma.news.deleteMany()
  await prisma.forumThread.deleteMany()
  await prisma.forumBoard.deleteMany()
  await prisma.spell.deleteMany()
  await prisma.monster.deleteMany()
  await prisma.faq.deleteMany()
  await prisma.pollAnswer.deleteMany()
  await prisma.poll.deleteMany()

  // Create accounts
  const accounts = []
  const accountData = [
    { name: 'Admin', email: 'admin@jo-server.com', type: 6, premDays: 365 },
    { name: 'GodPlayer', email: 'god@jo-server.com', type: 5, premDays: 365 },
    { name: 'Eldric', email: 'eldric@gmail.com', type: 1, premDays: 30 },
    { name: 'SirKael', email: 'kael@gmail.com', type: 1, premDays: 0 },
    { name: 'Lyra', email: 'lyra@gmail.com', type: 1, premDays: 60 },
    { name: 'Thorin', email: 'thorin@gmail.com', type: 1, premDays: 0 },
    { name: 'Shadow', email: 'shadow@gmail.com', type: 1, premDays: 90 },
  ]

  const crypto = require('crypto')
  for (const ad of accountData) {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.createHash('sha256').update(salt + 'admin123').digest('hex')
    accounts.push(await prisma.account.create({
      data: { ...ad, password: hash, salt, coins: Math.floor(Math.random() * 500) },
    }))
  }

  // Create players using actual account IDs
  const players = []
  const aIds = accounts.map(a => a.id)
  const playerData = [
    { name: 'Eldric the Wise', accountId: aIds[2], level: 350, vocation: 5, maglevel: 95, sex: 0, online: true, experience: 150000000 },
    { name: 'Sir Kael', accountId: aIds[3], level: 280, vocation: 8, maglevel: 20, sex: 0, online: true, experience: 75000000 },
    { name: 'Lyra Stormweaver', accountId: aIds[4], level: 310, vocation: 6, maglevel: 88, sex: 1, online: true, experience: 110000000 },
    { name: 'Thorin Ironfist', accountId: aIds[5], level: 250, vocation: 4, maglevel: 15, sex: 0, online: false, experience: 55000000 },
    { name: 'Shadow Blade', accountId: aIds[6], level: 220, vocation: 7, maglevel: 35, sex: 0, online: false, experience: 40000000 },
    { name: 'Aria Fireheart', accountId: aIds[2], level: 200, vocation: 1, maglevel: 80, sex: 1, online: true, experience: 30000000 },
    { name: 'Zara the Healer', accountId: aIds[4], level: 180, vocation: 2, maglevel: 75, sex: 1, online: false, experience: 22000000 },
    { name: 'Grommash', accountId: aIds[5], level: 150, vocation: 4, maglevel: 10, sex: 0, online: true, experience: 12000000 },
    { name: 'Sylva Windrunner', accountId: aIds[6], level: 165, vocation: 3, maglevel: 40, sex: 1, online: false, experience: 16000000 },
    { name: 'Drakon', accountId: aIds[3], level: 130, vocation: 8, maglevel: 12, sex: 0, online: false, experience: 9000000 },
    { name: 'Mystic Elf', accountId: aIds[2], level: 100, vocation: 5, maglevel: 60, sex: 0, online: false, experience: 5000000 },
    { name: 'BloodHunter', accountId: aIds[6], level: 90, vocation: 3, maglevel: 25, sex: 0, online: false, experience: 3500000 },
    { name: 'IceQueen', accountId: aIds[4], level: 175, vocation: 6, maglevel: 70, sex: 1, online: true, experience: 20000000 },
    { name: 'FireLord', accountId: aIds[3], level: 145, vocation: 1, maglevel: 65, sex: 0, online: false, experience: 10000000 },
    { name: 'DarkPriest', accountId: aIds[5], level: 120, vocation: 2, maglevel: 55, sex: 0, online: false, experience: 7000000 },
    { name: 'Admin Character', accountId: aIds[0], level: 500, vocation: 0, maglevel: 150, sex: 0, online: true, experience: 999999999, group_id: 6 },
    { name: 'GM Helper', accountId: aIds[1], level: 400, vocation: 0, maglevel: 120, sex: 0, online: false, experience: 500000000, group_id: 4 },
    { name: 'Rookie Warrior', accountId: aIds[2], level: 8, vocation: 4, maglevel: 0, sex: 0, online: true, experience: 4200 },
    { name: 'Novice Mage', accountId: aIds[3], level: 12, vocation: 1, maglevel: 15, sex: 0, online: true, experience: 12000 },
    { name: 'Wandering Paladin', accountId: aIds[4], level: 45, vocation: 3, maglevel: 18, sex: 1, online: false, experience: 500000 },
  ]

  for (const pd of playerData) {
    players.push(await prisma.player.create({ data: pd }))
  }

  // Create skills for all players
  for (const p of players) {
    const skillValues = [
      p.vocation >= 4 ? Math.floor(p.level * 0.8) : Math.floor(p.level * 0.5), // fist
      Math.floor(Math.random() * 60 + 20), // club
      p.vocation === 2 || p.vocation === 6 ? Math.floor(Math.random() * 40 + 10) : Math.floor(Math.random() * 60 + 20), // sword
      p.vocation === 4 || p.vocation === 8 ? Math.floor(Math.random() * 70 + 30) : Math.floor(Math.random() * 30 + 10), // axe
      p.vocation === 3 || p.vocation === 7 ? Math.floor(Math.random() * 80 + 40) : Math.floor(Math.random() * 20 + 5), // distance
      Math.floor(Math.random() * 50 + 30), // shielding
      Math.floor(Math.random() * 20 + 5), // fishing
      p.maglevel || 0, // magic level
    ]
    for (let i = 0; i < skillValues.length; i++) {
      await prisma.playerSkill.create({
        data: { player_id: p.id, skillid: i, value: skillValues[i] },
      })
    }
  }

  // Create guilds using actual account IDs
  const guildData = [
    { name: 'Knights of Valor', ownerid: aIds[3], motd: 'Honor and Glory!', description: 'Los más valientes guerreros del servidor. Nos dedicamos a proteger a los débiles y combatir el mal.' },
    { name: 'Arcane Circle', ownerid: aIds[2], motd: 'Knowledge is Power', description: 'Comunidad de magos y sabios. Buscamos el conocimiento ancestral y dominar las artes arcanas.' },
    { name: 'Shadow Assassins', ownerid: aIds[6], motd: 'Silence before the storm', description: 'La muerte viene de las sombras. Somos los más sigilosos y letales del servidor.' },
    { name: 'Holy Paladins', ownerid: aIds[4], motd: 'Light shall prevail!', description: 'Paladines sagrados dedicados a erradicar el mal del mundo.' },
  ]

  const guilds = []
  for (const gd of guildData) {
    const guild = await prisma.guild.create({ data: gd })
    guilds.push(guild)

    // Create ranks
    await prisma.guildRank.createMany({
      data: [
        { guild_id: guild.id, name: 'Líder', level: 3 },
        { guild_id: guild.id, name: 'Vice-Líder', level: 2 },
        { guild_id: guild.id, name: 'Miembro', level: 1 },
      ],
    })

    const ranks = await prisma.guildRank.findMany({ where: { guild_id: guild.id }, orderBy: { level: 'desc' } })

    // Add guild members (avoid duplicates by tracking assigned player IDs)
    const usedPlayerIds = new Set<number>()
    const availablePlayers = players.filter(p => {
      if (p.accountId === gd.ownerid || Math.random() > 0.7) {
        if (!usedPlayerIds.has(p.id)) { usedPlayerIds.add(p.id); return true }
      }
      return false
    }).slice(0, Math.floor(Math.random() * 5) + 3)
    for (let i = 0; i < availablePlayers.length; i++) {
      const rank = i === 0 ? ranks[0] : ranks[Math.min(i, ranks.length - 1)]
      try {
        await prisma.guildMember.create({
          data: { player_id: availablePlayers[i].id, guild_id: guild.id, rank_id: rank.id, nick: i === 0 ? 'Leader' : '' },
        })
      } catch (e) { /* skip if duplicate */ }
    }
  }

  // Create news
  const newsData = [
    { title: '¡Servidor Actualizado a v2.0!', body: 'Hemos implementado nuevas mejoras: sistema de guilds renovado, nuevas quests épicas, balanceo de vocaciones y mucho más. ¡No te lo pierdas!', type: 1, date: Math.floor(Date.now() / 1000) - 86400, category: 1, articleText: 'Grandes mejoras llegan a nuestro servidor con la versión 2.0.' },
    { title: 'Evento de Caza de Bosses', body: 'Este fin de semana tendrás la oportunidad de enfrentarte a los jefes más poderosos del servidor. ¡Prepárate para la batalla!', type: 1, date: Math.floor(Date.now() / 1000) - 172800, category: 2, articleText: 'Evento especial de caza de bosses este fin de semana.' },
    { title: 'Nuevas Criaturas Descubiertas', body: 'Se han avistado nuevas criaturas en las profundidades de las mazmorras. Los aventureros más valientes deberán investigar.', type: 1, date: Math.floor(Date.now() / 1000) - 259200, category: 3 },
    { title: 'Mantenimiento Programado', body: 'El servidor estará en mantenimiento este viernes desde las 22:00 hasta las 23:59 (hora del servidor). Pedimos disculpas por los inconvenientes.', type: 1, date: Math.floor(Date.now() / 1000) - 345600, category: 0 },
    { title: 'Torneo PvP Semanal', body: '¡Inscríbete en el torneo PvP semanal! Grandes premios esperan a los campeones. Consulta las reglas en el foro.', type: 1, date: Math.floor(Date.now() / 1000) - 432000, category: 1 },
    { title: 'Bienvenidos a JO Server OT', body: '¡Bienvenidos al mejor servidor Open Tibia! Características únicas, comunidad activa y eventos diarios te esperan. ¡Regístrate ahora!', type: 1, date: Math.floor(Date.now() / 1000) - 604800, category: 0, articleText: 'Tu aventura comienza aquí.' },
    { title: 'Nuevo sistema de market', body: 'Ya disponible el sistema de mercado entre jugadores. Compra y vende objetos directamente.', type: 2, date: Math.floor(Date.now() / 1000) - 50000 },
    { title: 'Double XP este fin de semana', body: '¡Duplica tu experiencia este fin de semana! Desde el viernes hasta el domingo.', type: 2, date: Math.floor(Date.now() / 1000) - 30000 },
    { title: 'Guild War: Knights vs Assassins', body: 'La guerra entre guilds ha comenzado. ¡Apoya a tu guild favorita!', type: 2, date: Math.floor(Date.now() / 1000) - 10000 },
  ]

  for (const nd of newsData) {
    await prisma.news.create({ data: nd })
  }

  // Create forum boards and store IDs
  const createdBoards = []
  const boardData = [
    { name: 'Noticias', description: 'Discusión sobre noticias del servidor.', ordering: 0, closed: true },
    { name: 'Trade', description: 'Ofertas de intercambio entre jugadores.', ordering: 1 },
    { name: 'Quests', description: 'Ayuda y discusión sobre quests.', ordering: 2 },
    { name: 'Guilds', description: 'Todo sobre guilds y alianzas.', ordering: 3 },
    { name: 'Soporte', description: 'Soporte técnico y reporte de bugs.', ordering: 4 },
    { name: 'Off-Topic', description: 'Conversación general.', ordering: 5 },
  ]

  for (const bd of boardData) {
    const board = await prisma.forumBoard.create({ data: bd })
    createdBoards.push(board)
  }

  // Create forum threads using actual board IDs
  const bIds = createdBoards.map(b => b.id)
  const threads = [
    { section: bIds[0], postTopic: '¡Bienvenidos al nuevo foro!', authorAid: aIds[0], authorGuid: players[15]?.id || 0, postText: 'Este es el nuevo foro del servidor.', postDate: Math.floor(Date.now() / 1000) - 100000, replies: 5, views: 120 },
    { section: bIds[1], postTopic: 'Vendo Demon Armor - 5k', authorAid: aIds[2], authorGuid: players[0]?.id || 0, postText: 'Vendo Demon Armor por 5000 gold coins.', postDate: Math.floor(Date.now() / 1000) - 80000, replies: 3, views: 45 },
    { section: bIds[2], postTopic: 'Guía de la Quest del Demon', authorAid: aIds[4], authorGuid: players[2]?.id || 0, postText: 'Les traigo una guía completa de la quest del demon...', postDate: Math.floor(Date.now() / 1000) - 60000, replies: 8, views: 200 },
    { section: bIds[3], postTopic: '¿Buscas guild? Únete a Knights of Valor', authorAid: aIds[3], authorGuid: players[1]?.id || 0, postText: 'Estamos reclutando miembros activos de nivel 50+', postDate: Math.floor(Date.now() / 1000) - 40000, replies: 12, views: 180 },
    { section: bIds[4], postTopic: 'Bug con el respawn', authorAid: aIds[5], authorGuid: players[3]?.id || 0, postText: 'El respawn de los dragones no funciona correctamente.', postDate: Math.floor(Date.now() / 1000) - 20000, replies: 2, views: 30 },
  ]

  for (const td of threads) {
    try { await prisma.forumThread.create({ data: td }) } catch (e) { /* skip */ }
  }

  // Create spells
  const spellData = [
    { name: 'Exori Vis', words: 'exori vis', category: 1, type: 1, level: 14, maglevel: 0, mana: 20, vocations: '1;5' },
    { name: 'Exevo Gran Mas Frigo', words: 'exevo gran mas frigo', category: 1, type: 1, level: 60, maglevel: 60, mana: 1000, vocations: '1;5' },
    { name: 'Exura', words: 'exura', category: 2, type: 1, level: 8, maglevel: 0, mana: 20, vocations: '0;1;2;3;4;5;6;7;8' },
    { name: 'Exura Vita', words: 'exura vita', category: 2, type: 1, level: 20, maglevel: 0, mana: 50, vocations: '2;6' },
    { name: 'Exori', words: 'exori', category: 1, type: 1, level: 70, maglevel: 0, mana: 100, vocations: '4;8' },
    { name: 'Utevo Lux', words: 'utevo lux', category: 5, type: 1, level: 8, maglevel: 0, mana: 20, vocations: '0;1;2;3;4;5;6;7;8' },
    { name: 'Utani Hur', words: 'utani hur', category: 5, type: 1, level: 20, maglevel: 0, mana: 60, vocations: '0;1;2;3;4;5;6;7;8' },
    { name: 'Exura Gran', words: 'exura gran', category: 2, type: 1, level: 30, maglevel: 0, mana: 70, vocations: '1;2;3;4;5;6;7;8' },
    { name: 'Exori San', words: 'exori san', category: 2, type: 1, level: 65, maglevel: 0, mana: 160, vocations: '3;7' },
    { name: 'Executio', words: 'executio', category: 1, type: 1, level: 28, maglevel: 0, mana: 35, vocations: '4;8' },
    { name: 'Avalanche Rune', words: 'adori mas frigo', category: 1, type: 3, level: 30, maglevel: 4, mana: 530, vocations: '1;5', itemId: 3161 },
    { name: 'GFB Rune', words: 'adori mas flam', category: 1, type: 3, level: 27, maglevel: 4, mana: 460, vocations: '1;5', itemId: 3191 },
    { name: 'SD Rune', words: 'adori vita vis', category: 1, type: 3, level: 35, maglevel: 4, mana: 620, vocations: '1;2;5;6', itemId: 3155 },
    { name: 'UH Rune', words: 'adevo res', category: 2, type: 3, level: 24, maglevel: 1, mana: 350, vocations: '2;6', itemId: 3160 },
    { name: 'Light Rune', words: 'adevo in vis', category: 5, type: 3, level: 25, maglevel: 0, mana: 120, vocations: '0;1;2;3;4;5;6;7;8', itemId: 3190 },
  ]

  for (const sd of spellData) {
    await prisma.spell.create({ data: sd })
  }

  // Create monsters
  const monsterData = [
    { name: 'Rat', exp: 5, health: 20, mana: 0, speedLvl: 1, race: 'blood', attackable: true, hostile: false },
    { name: 'Spider', exp: 12, health: 35, mana: 0, speedLvl: 1, race: 'venom', attackable: true, hostile: true },
    { name: 'Orc', exp: 25, health: 70, mana: 0, speedLvl: 1, race: 'human', attackable: true, hostile: true },
    { name: 'Wolf', exp: 30, health: 60, mana: 0, speedLvl: 2, race: 'blood', attackable: true, hostile: true },
    { name: 'Cyclops', exp: 150, health: 260, mana: 0, speedLvl: 1, race: 'blood', attackable: true, hostile: true },
    { name: 'Minotaur', exp: 50, health: 120, mana: 0, speedLvl: 1, race: 'blood', attackable: true, hostile: true },
    { name: 'Demon', exp: 6000, health: 8000, mana: 2000, speedLvl: 2, race: 'fire', attackable: true, hostile: true, rewardboss: true },
    { name: 'Dragon', exp: 700, health: 1000, mana: 0, speedLvl: 2, race: 'fire', attackable: true, hostile: true },
    { name: 'Dragon Lord', exp: 1700, health: 1900, mana: 0, speedLvl: 2, race: 'fire', attackable: true, hostile: true },
    { name: 'Vampire', exp: 435, health: 605, mana: 0, speedLvl: 2, race: 'undead', attackable: true, hostile: true },
    { name: 'Bone Beast', exp: 525, health: 740, mana: 0, speedLvl: 1, race: 'undead', attackable: true, hostile: true },
    { name: 'Lich', exp: 1500, health: 2200, mana: 3000, speedLvl: 2, race: 'undead', attackable: true, hostile: true, rewardboss: true },
    { name: 'Wyrm', exp: 2350, health: 3250, mana: 0, speedLvl: 2, race: 'undead', attackable: true, hostile: true },
    { name: 'Hydra', exp: 1005, health: 1350, mana: 0, speedLvl: 2, race: 'venom', attackable: true, hostile: true },
    { name: 'Serpent Spawn', exp: 2150, health: 2920, mana: 0, speedLvl: 2, race: 'venom', attackable: true, hostile: true },
  ]

  for (const md of monsterData) {
    await prisma.monster.create({ data: md })
  }

  // Create FAQs
  const faqData = [
    { question: '¿Cómo creo una cuenta?', answer: 'Haz clic en "Registro" en el menú superior. Ingresa un nombre de cuenta, email válido y una contraseña de al menos 6 caracteres.', ordering: 1 },
    { question: '¿Cómo creo un personaje?', answer: 'Después de iniciar sesión, ve a la sección de "Mi Cuenta" y haz clic en "Crear Personaje". Elige nombre, vocación y sexo.', ordering: 2 },
    { question: '¿Cómo obtengo premium?', answer: 'Puedes obtener días premium en la tienda del servidor o contactando a un GameMaster en eventos especiales.', ordering: 3 },
    { question: '¿Cuáles son las reglas?', answer: 'Las reglas están disponibles en la sección "Reglas" del menú. Por favor léelas antes de jugar.', ordering: 4 },
  ]

  for (const fd of faqData) {
    await prisma.faq.create({ data: fd })
  }

  // Polls and deaths are created later (after bans)

  // Create content pages
  const pageData = [
    {
      name: 'rules',
      title: 'Reglas del Servidor',
      body: `<h3>1. Comportamiento General</h3>\n<p>Respeta a todos los jugadores y miembros del staff. No se permite el uso de lenguaje ofensivo, discriminatorio o intimidatorio. Las discusiones deben mantenerse en un nivel civil y respetuoso en todo momento.</p>\n<h3>2. Uso de Bugs y Exploits</h3>\n<p>Queda estrictamente prohibido el aprovechamiento de cualquier bug o exploit del juego. Si descubres un error, repórtalo inmediatamente a través del Bug Tracker. Los jugadores que aprovechen bugs serán sancionados.</p>\n<h3>3. Multicuentas y Bots</h3>\n<p>No se permite el uso de más de una cuenta por jugador sin autorización previa. El uso de bots, macros o cualquier software de automatización está prohibido y resultará en ban permanente.</p>\n<h3>4. Comercio Justo</h3>\n<p>Los engaños en el comercio entre jugadores están prohibidos. Esto incluye ofrecer items que no posees, cambiar el precio acordado o desconectarse durante una transacción.</p>\n<h3>5. Player Killing (PK)</h3>\n<p>El player killing excesivo sin justificación será sancionado. El abuso del sistema de skull para acoso continuo a otros jugadores no será tolerado.</p>\n<h3>6. Publicidad</h3>\n<p>No se permite la publicidad de otros servidores, sitios web o servicios no relacionados con JO Server OT en el juego, foro o chat.</p>\n<h3>7. Sanciones</h3>\n<p>Las sanciones van desde advertencias y notaciones hasta bans temporales o permanentes, dependiendo de la gravedad de la infracción. Los bans pueden apelarse a través del foro.</p>`,
      date: Math.floor(Date.now() / 1000),
    },
    {
      name: 'faq',
      title: 'Preguntas Frecuentes',
      body: `<h3>¿Cómo creo una cuenta?</h3>\n<p>Haz clic en "Registro" en el menú principal. Completa el formulario con un nombre de cuenta, email y contraseña. Recibirás un email de confirmación. Una vez verificada, podrás crear tu primer personaje.</p>\n<h3>¿Cómo creo un personaje?</h3>\n<p>Después de iniciar sesión, ve a "Mi Cuenta" y haz clic en "Crear Personaje". Elige un nombre, vocación y sexo. Cada cuenta puede tener hasta 7 personajes.</p>\n<h3>¿Cuáles son las vocaciones disponibles?</h3>\n<p><b>Hechicero</b> - Magia ofensiva poderosa. <b>Druida</b> - Magia de curación y soporte. <b>Paladín</b> - Combate a distancia y versatilidad. <b>Caballero</b> - Alta resistencia y daño cuerpo a cuerpo. Cada vocación tiene promociones en nivel 8.</p>\n<h3>¿Cómo obtengo Premium Account?</h3>\n<p>Puedes obtener días de Premium a través de la tienda en el juego, completando eventos especiales, o donando al servidor. La Premium Account te da acceso a spells exclusivos, áreas premium y más.</p>\n<h3>¿Cómo unirme a una Guild?</h3>\n<p>Busca la guild que te interese en la sección de Guilds. El líder de la guild debe invitarte. Una vez invitado, puedes aceptar la invitación desde tu panel de personaje.</p>\n<h3>¿Qué hago si encuentro un bug?</h3>\n<p>Reporta cualquier bug a través del Bug Tracker en nuestro sitio web. Incluye una descripción detallada y, si es posible, capturas de pantalla. Los bugs reportados nos ayudan a mejorar el servidor.</p>\n<h3>¿Cómo reporto a un jugador?</h3>\n<p>Utiliza el sistema de reportes en el juego o contacta a un GameMaster a través del foro. Incluye pruebas como capturas de pantalla o logs del chat.</p>`,
      date: Math.floor(Date.now() / 1000),
    },
    {
      name: 'serverinfo',
      title: 'Información del Servidor',
      body: `<h3>Datos del Servidor</h3>\n<p><b>Nombre:</b> JO Server OT<br><b>IP:</b> play.jo-server.com<br><b>Puerto:</b> 7171<br><b>Cliente:</b> 12.x / 13.x<br><b>Tipo:</b> Open PvP<br><b>Status:</b> Online</p>\n<h3>Server Rates</h3>\n<p><b>Experience:</b> 5x<br><b>Skills:</b> 4x<br><b>Magic:</b> 3x<br><b>Loot:</b> 2x<br><b>Spawns:</b> 1x (retail)</p>\n<h3>Características</h3>\n<p>Sistema de guilds completo, wars entre guilds, arena PvP, sistema de quests, mercado de personajes (Character Bazaar), sistema de achievement, caza de bosses, eventos semanales, sistema de prey y blessing.</p>\n<h3>Equipo de Desarrollo</h3>\n<p>Este servidor utiliza tecnología moderna con Next.js, React, TypeScript y PostgreSQL para ofrecer la mejor experiencia web posible.</p>`,
      date: Math.floor(Date.now() / 1000),
    },
    {
      name: 'commands',
      title: 'Comandos del Servidor',
      body: `<h3>Comandos de Jugador</h3>\n<p><b>!online</b> - Muestra los jugadores conectados<br><b>!buyhouse</b> - Compra la casa donde estás parado<br><b>!sellhouse</b> - Vende tu casa<br><b>!aol</b> - Compra un Amulet of Loss<br><b>!bless</b> - Compra todas las bless<br><b>!frags</b> - Muestra tu conteo de frags<br><b>!prey</b> - Abre el sistema de prey<br><b>!tasks</b> - Muestra tus tareas activas</p>\n<h3>Comandos de VIP/Premium</h3>\n<p><b>!cast</b> - Abre el sistema de spells avanzados<br><b>!xpboost</b> - Activa boost de experiencia<br><b>!housing</b> - Gestiona tu casa</p>\n<h3>Comandos de Tutor+</h3>\n<p><b>/ban</b> - Banea a un jugador<br><b>/unban</b> - Desbanea a un jugador<br><b>/kick</b> - Kickea a un jugador del servidor<br><b>/mute</b> - Silencia a un jugador<br><b>/teleport</b> - Teletransporta a coordenadas</p>`,
      date: Math.floor(Date.now() / 1000),
    },
    {
      name: 'team',
      title: 'Equipo del Servidor',
      body: `<h3>Administradores</h3>\n<p><b>Admin</b> — Dios del servidor. Encargado de la administración general, mantenimiento y desarrollo del servidor.</p>\n<p><b>GodPlayer</b> — Community Manager. Gestión de la comunidad, eventos y atención al usuario.</p>\n<h3>GameMasters</h3>\n<p><b>GM Helper</b> — GameMaster. Supervisión del juego, resolución de reportes y soporte en línea.</p>\n<h3>¿Cómo convertirse en Staff?</h3>\n<p>Las posiciones de staff se abren periódicamente. Mantén un buen historial, ayuda a la comunidad y participa activamente. Las aplicaciones se realizan a través del foro cuando hay vacantes disponibles.</p>`,
      date: Math.floor(Date.now() / 1000),
    },
    {
      name: 'houses',
      title: 'Sistema de Casas',
      body: `<h3>¿Qué son las casas?</h3>\n<p>Las casas son propiedades inmobiliarias dentro del juego que los jugadores pueden comprar y utilizar como almacenamiento personal y punto de descanso.</p>\n<h3>¿Cómo comprar una casa?</h3>\n<p>Para comprar una casa, debes estar frente a la puerta de la casa deseada y usar el comando <b>!buyhouse</b>. Debes tener el nivel mínimo requerido y suficiente oro para pagar el alquiler.</p>\n<h3>Alquiler y mantenimiento</h3>\n<p>Las casas tienen un costo de alquiler semanal que se descuenta automáticamente de tu balance bancario. Si no tienes fondos suficientes, perderás la casa tras un período de gracia.</p>\n<h3>Características de las casas</h3>\n<p>Almacenamiento de items en cofres y contenedores, reposición de spawn de NPCs en algunas ubicaciones, decoración personalizable, y acceso exclusivo para el propietario y personajes invitados.</p>\n<h3>¿Cómo vender una casa?</h3>\n<p>Utiliza el comando <b>!sellhouse</b> estando dentro de tu casa. El alquiler pendiente será descontado del precio de venta.</p>`,
      date: Math.floor(Date.now() / 1000),
    },
  ]

  for (const pd of pageData) {
    await prisma.page.create({ data: pd })
  }

  // Create some bans
  await prisma.ban.createMany({
    data: [
      { type: 2, value: 'TrainerBot', active: true, expires: Math.floor(Date.now() / 1000) + 604800, added: Math.floor(Date.now() / 1000) - 172800, reason: 'Uso de bot', by: 'Admin', action: 3 },
      { type: 1, value: '192.168.1.100', active: true, expires: Math.floor(Date.now() / 1000) + 259200, added: Math.floor(Date.now() / 1000) - 86400, reason: 'Spam en el chat', by: 'GM Helper', action: 1 },
    ],
  })

  // Create changelog entries
  const now = Math.floor(Date.now() / 1000)
  await prisma.changelog.createMany({
    data: [
      { body: 'Sistema de guilds implementado con creación, invitaciones y gestión de rangos', type: 1, where: 2, date: now },
      { body: 'Nuevos hechizos para vocaciones premium añadidos', type: 1, where: 1, date: now - 86400 },
      { body: 'Corregido bug en el cálculo de experiencia de grupo', type: 4, where: 1, date: now - 172800 },
      { body: 'Interfaz del foro rediseñada completamente', type: 3, where: 2, date: now - 259200 },
      { body: 'Sistema de Character Bazaar implementado', type: 1, where: 1, date: now - 345600 },
      { body: 'Nuevas quests en la zona de Demon Fortress', type: 1, where: 1, date: now - 432000 },
      { body: 'Eliminado sistema de bless temporal', type: 2, where: 1, date: now - 518400 },
      { body: 'Corregido crash al cambiar de vocación', type: 4, where: 1, date: now - 604800 },
    ],
  })

  // Create bug reports
  await prisma.bugTracker.createMany({
    data: [
      { account: 'Admin', type: 0, status: 0, subject: 'Error al usar potion en combate PvP', text: 'Al usar una great health potion durante un combate PvP, el personaje se queda congelado por 2 segundos y no puede moverse.', date: new Date() },
      { account: 'SirKael', type: 0, status: 1, subject: 'Monstruo Dragon Lord no spawnea correctamente', text: 'El spawn de Dragon Lords en la dungeon de Darashia no está funcionando. No aparecen monstruos después del server save.', date: new Date(Date.now() - 86400000) },
      { account: 'Lyra', type: 1, status: 0, subject: 'Sugerencia: Sistema de diario de quest', text: 'Sería genial tener un diario de quests que registre las quests completadas y pendientes con detalles de progreso.', date: new Date(Date.now() - 172800000) },
    ],
  })

  // Create new poll (replacing the existing one)
  await prisma.pollAnswer.deleteMany()
  await prisma.poll.deleteMany()

  const newPoll = await prisma.poll.create({
    data: {
      question: '¿Qué vocación debería recibir un buff en el próximo update?',
      description: 'Vota por la vocación que crees que necesita más mejoras',
      startDate: now - 86400,
      endDate: now + 604800,
      answers: 4,
      votesAll: 63,
    },
  })

  await prisma.pollAnswer.createMany({
    data: [
      { pollId: newPoll.id, answerId: 1, answer: 'Hechicero', votes: 15 },
      { pollId: newPoll.id, answerId: 2, answer: 'Druida', votes: 8 },
      { pollId: newPoll.id, answerId: 3, answer: 'Paladín', votes: 22 },
      { pollId: newPoll.id, answerId: 4, answer: 'Caballero', votes: 18 },
    ],
  })

  // Create gallery entries
  await prisma.gallery.createMany({
    data: [
      { comment: 'Primera guerra de guilds - Shadow Legion vs Dark Knights', author: 'Admin', ordering: 1 },
      { comment: 'Evento de Halloween 2024', author: 'GameMaster', ordering: 2 },
      { comment: 'Captura del boss The Undying', author: 'ElderDruid', ordering: 3 },
      { comment: 'Nuevo mapa de la zona de Yasir', author: 'Admin', ordering: 4 },
    ],
  })

  // Create additional player deaths
  await prisma.playerDeath.createMany({
    data: [
      { player_id: players[6]?.id || 7, date: new Date(Date.now() - 3600000 * 5), level: 179 },
      { player_id: players[7]?.id || 8, date: new Date(Date.now() - 3600000 * 12), level: 148 },
      { player_id: players[8]?.id || 9, date: new Date(Date.now() - 86400000 * 2), level: 163 },
      { player_id: players[9]?.id || 10, date: new Date(Date.now() - 86400000 * 3), level: 128 },
      { player_id: players[11]?.id || 12, date: new Date(Date.now() - 86400000 * 4), level: 89 },
      { player_id: players[12]?.id || 13, date: new Date(Date.now() - 86400000 * 6), level: 174 },
      { player_id: players[13]?.id || 14, date: new Date(Date.now() - 86400000 * 8), level: 143 },
      { player_id: players[14]?.id || 15, date: new Date(Date.now() - 86400000 * 10), level: 119 },
      { player_id: players[17]?.id || 18, date: new Date(Date.now() - 86400000 * 1), level: 7 },
    ],
  })

  console.log('Seed completed successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
