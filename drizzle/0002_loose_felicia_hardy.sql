ALTER TABLE `usuarios` ADD `role` enum('user','admin') DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE `usuarios` ADD `status` varchar(20) DEFAULT 'Ativo';