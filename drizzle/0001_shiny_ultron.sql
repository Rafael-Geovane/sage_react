CREATE TABLE `admins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`email` varchar(150) NOT NULL,
	`senha_hash` varchar(255) NOT NULL,
	`nivel_acesso` varchar(30) NOT NULL DEFAULT 'operador',
	`criado_em` timestamp DEFAULT (now()),
	CONSTRAINT `admins_id` PRIMARY KEY(`id`),
	CONSTRAINT `admins_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `cuidadores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`telefone` varchar(20) NOT NULL,
	`email` varchar(150),
	`parentesco` varchar(50),
	`id_usuario` int NOT NULL,
	`criado_em` timestamp DEFAULT (now()),
	CONSTRAINT `cuidadores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dispositivos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`codigo_serial` varchar(50) NOT NULL,
	`versao_firmware` varchar(20),
	`nivel_bateria` int,
	`tipo_conexao` varchar(20),
	`status_conexao` varchar(20),
	`tempo_ultimo_sinal` varchar(30),
	`id_usuario` int,
	`atualizado_em` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dispositivos_id` PRIMARY KEY(`id`),
	CONSTRAINT `dispositivos_codigo_serial_unique` UNIQUE(`codigo_serial`)
);
--> statement-breakpoint
CREATE TABLE `eventos_saude` (
	`id` int AUTO_INCREMENT NOT NULL,
	`frequencia_cardiaca` int,
	`oxigenacao_spo2` int,
	`temperatura_corporal` decimal(4,1),
	`quedas_detectadas` int,
	`localizacao_endereco` varchar(255),
	`categoria_evento` varchar(50),
	`descricao_evento` text,
	`id_usuario` int NOT NULL,
	`id_dispositivo` int,
	`data_hora_registro` datetime NOT NULL,
	CONSTRAINT `eventos_saude_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leitura_sensores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`id_dispositivo` int NOT NULL,
	`id_usuario` int,
	`payload` json,
	`frequencia_cardiaca` int,
	`oxigenacao_spo2` int,
	`temperatura_corporal` decimal(4,1),
	`acelerometro_x` decimal(8,3),
	`acelerometro_y` decimal(8,3),
	`acelerometro_z` decimal(8,3),
	`giroscopio_x` decimal(8,3),
	`giroscopio_y` decimal(8,3),
	`giroscopio_z` decimal(8,3),
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`nivel_bateria` int,
	`queda_detectada` boolean DEFAULT false,
	`timestamp_sensor` datetime,
	`recebido_em` timestamp DEFAULT (now()),
	CONSTRAINT `leitura_sensores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pedidos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numero_pedido` varchar(50) NOT NULL,
	`valor` varchar(30),
	`forma_pagamento` varchar(30),
	`status` varchar(30),
	`cor_colete` varchar(30),
	`tamanho_colete` varchar(5),
	`nome_plano` varchar(30),
	`id_usuario` int NOT NULL,
	`id_admin_responsavel` int,
	`criado_em` timestamp DEFAULT (now()),
	CONSTRAINT `pedidos_id` PRIMARY KEY(`id`),
	CONSTRAINT `pedidos_numero_pedido_unique` UNIQUE(`numero_pedido`)
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numero_ticket` varchar(50) NOT NULL,
	`assunto` varchar(255),
	`prioridade` varchar(20),
	`status` varchar(30),
	`id_usuario` int NOT NULL,
	`id_admin_responsavel` int,
	`criado_em` timestamp DEFAULT (now()),
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `tickets_numero_ticket_unique` UNIQUE(`numero_ticket`)
);
--> statement-breakpoint
CREATE TABLE `usuarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`cpf` varchar(14),
	`data_nascimento` varchar(10),
	`endereco` varchar(255),
	`telefone` varchar(20),
	`email` varchar(150),
	`senha_hash` varchar(255),
	`nome_plano` varchar(30),
	`notificar_push` boolean DEFAULT false,
	`notificar_sms` boolean DEFAULT false,
	`notificar_ligacao` boolean DEFAULT false,
	`id_admin_responsavel` int,
	`tipo_sanguineo` varchar(10),
	`condicoes_medicas` varchar(500),
	`alergias` varchar(500),
	`medicamentos` varchar(500),
	`criado_em` timestamp DEFAULT (now()),
	CONSTRAINT `usuarios_id` PRIMARY KEY(`id`),
	CONSTRAINT `usuarios_cpf_unique` UNIQUE(`cpf`),
	CONSTRAINT `usuarios_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `idx_disp_recebido` ON `leitura_sensores` (`id_dispositivo`,`recebido_em`);--> statement-breakpoint
CREATE INDEX `idx_user_recebido` ON `leitura_sensores` (`id_usuario`,`recebido_em`);