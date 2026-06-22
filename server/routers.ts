import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  countDispositivosOnline, countTicketsAbertos, countUsuarios,
  createCuidador, createDispositivo, createEventoSaude, createPedido,
  createTicket, createUsuario, deleteCuidador, deleteDispositivo,
  deleteTicket, deleteUsuario, getCuidadoresByUsuario, getDispositivos,
  getDispositivoBySerial, getEventosSaude, getPedidos, getTickets,
  getUltimaLeituraByUsuario, getUltimasLeituras, getUsuarioByEmail,
  getUsuarioById, getUsuarios, ingestLeitura, updateCuidador,
  updateDispositivo, updatePedido, updateTicket, updateUsuario,
  getLeiturasHistorico, getLeiturasResumoDiario,
} from "./db";

// Admin middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── USUARIOS ─────────────────────────────────────────────────────────────
  usuarios: router({
    list: adminProcedure
      .input(z.object({ search: z.string().optional() }).optional())
      .query(({ input }) => getUsuarios(input?.search)),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getUsuarioById(input.id)),

    create: publicProcedure
      .input(z.object({
        nome: z.string().min(2),
        email: z.string().email(),
        senha: z.string().min(6),
        cpf: z.string().optional(),
        dataNascimento: z.string().optional(),
        telefone: z.string().optional(),
        endereco: z.string().optional(),
        nomePlano: z.string().optional(),
        tipoSanguineo: z.string().optional(),
        condicoesMedicas: z.string().optional(),
        alergias: z.string().optional(),
        medicamentos: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const existing = await getUsuarioByEmail(input.email);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "E-mail já cadastrado." });
        await createUsuario({
          nome: input.nome,
          email: input.email,
          senhaHash: input.senha,
          cpf: input.cpf,
          dataNascimento: input.dataNascimento,
          telefone: input.telefone,
          endereco: input.endereco,
          nomePlano: input.nomePlano ?? "Básico",
          tipoSanguineo: input.tipoSanguineo,
          condicoesMedicas: input.condicoesMedicas,
          alergias: input.alergias,
          medicamentos: input.medicamentos,
        });
        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        email: z.string().email().optional(),
        telefone: z.string().optional(),
        nomePlano: z.string().optional(),
        endereco: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updateUsuario(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteUsuario(input.id)),

    login: publicProcedure
      .input(z.object({ email: z.string().email(), senha: z.string() }))
      .mutation(async ({ input }) => {
        const usuario = await getUsuarioByEmail(input.email);
        if (!usuario) throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado." });
        // In production, compare hashed passwords
        if (usuario.senhaHash !== input.senha) throw new TRPCError({ code: "UNAUTHORIZED", message: "Senha incorreta." });
        return { success: true, usuario };
      }),
  }),

  // ─── CUIDADORES ───────────────────────────────────────────────────────────
  cuidadores: router({
    list: protectedProcedure
      .input(z.object({ idUsuario: z.number() }))
      .query(({ input }) => getCuidadoresByUsuario(input.idUsuario)),

    create: protectedProcedure
      .input(z.object({
        nome: z.string().min(2),
        telefone: z.string().min(8),
        email: z.string().email().optional(),
        parentesco: z.string().optional(),
        idUsuario: z.number(),
      }))
      .mutation(({ input }) => createCuidador(input)),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        telefone: z.string().optional(),
        email: z.string().email().optional(),
        parentesco: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updateCuidador(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteCuidador(input.id)),
  }),

  // ─── DISPOSITIVOS ─────────────────────────────────────────────────────────
  dispositivos: router({
    list: protectedProcedure
      .input(z.object({ idUsuario: z.number().optional() }).optional())
      .query(({ input }) => getDispositivos(input?.idUsuario)),

    create: adminProcedure
      .input(z.object({
        codigoSerial: z.string().min(3),
        versaoFirmware: z.string().optional(),
        nivelBateria: z.number().optional(),
        tipoConexao: z.string().optional(),
        statusConexao: z.string().optional(),
        idUsuario: z.number().optional(),
      }))
      .mutation(({ input }) => createDispositivo(input)),

    link: protectedProcedure
      .input(z.object({
        codigoSerial: z.string().min(1),
        idUsuario: z.number(),
      }))
      .mutation(async ({ input }) => {
        const disp = await getDispositivoBySerial(input.codigoSerial);
        if (!disp) throw new TRPCError({ code: "NOT_FOUND", message: "Dispositivo não encontrado." });
        return updateDispositivo(disp.id, { idUsuario: input.idUsuario });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nivelBateria: z.number().optional(),
        statusConexao: z.string().optional(),
        tipoConexao: z.string().optional(),
        versaoFirmware: z.string().optional(),
        idUsuario: z.number().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updateDispositivo(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteDispositivo(input.id)),
  }),

  // ─── PEDIDOS ──────────────────────────────────────────────────────────────
  pedidos: router({
    list: protectedProcedure
      .input(z.object({ idUsuario: z.number().optional() }).optional())
      .query(({ input }) => getPedidos(input?.idUsuario)),

    create: publicProcedure
      .input(z.object({
        numeroPedido: z.string(),
        valor: z.string().optional(),
        formaPagamento: z.string().optional(),
        status: z.string().optional(),
        corColete: z.string().optional(),
        tamanhoColete: z.enum(["P", "M", "G", "GG"]).optional(),
        nomePlano: z.enum(["Básico", "Premium", "HaaS"]).optional(),
        idUsuario: z.number(),
      }))
      .mutation(({ input }) => createPedido({ ...input, status: input.status ?? "Pend. Pagamento" })),

    updateStatus: adminProcedure
      .input(z.object({ id: z.number(), status: z.string() }))
      .mutation(({ input }) => updatePedido(input.id, { status: input.status })),
  }),

  // ─── TICKETS ──────────────────────────────────────────────────────────────
  tickets: router({
    list: protectedProcedure
      .input(z.object({ idUsuario: z.number().optional() }).optional())
      .query(({ input }) => getTickets(input?.idUsuario)),

    create: protectedProcedure
      .input(z.object({
        assunto: z.string().min(5),
        prioridade: z.enum(["Baixa", "Média", "Alta"]).optional(),
        idUsuario: z.number(),
      }))
      .mutation(({ input }) => {
        const numeroTicket = `#T-${Date.now().toString().slice(-4)}`;
        return createTicket({ ...input, numeroTicket, status: "Aguardando" });
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.string().optional(),
        prioridade: z.string().optional(),
        idAdminResponsavel: z.number().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updateTicket(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteTicket(input.id)),
  }),

  // ─── EVENTOS_SAUDE ────────────────────────────────────────────────────────
  eventosSaude: router({
    list: protectedProcedure
      .input(z.object({ idUsuario: z.number(), limit: z.number().optional() }))
      .query(({ input }) => getEventosSaude(input.idUsuario, input.limit)),

    create: protectedProcedure
      .input(z.object({
        frequenciaCardiaca: z.number().optional(),
        oxigenacaoSpo2: z.number().optional(),
        temperaturaCorporal: z.string().optional(),
        quedasDetectadas: z.number().optional(),
        localizacaoEndereco: z.string().optional(),
        categoriaEvento: z.string().optional(),
        descricaoEvento: z.string().optional(),
        idUsuario: z.number(),
        idDispositivo: z.number().optional(),
        dataHoraRegistro: z.date().optional(),
      }))
      .mutation(({ input }) => createEventoSaude({
        ...input,
        dataHoraRegistro: input.dataHoraRegistro ?? new Date(),
      })),
  }),

  // ─── SENSORES (ingestão IoT) ──────────────────────────────────────────────
  sensores: router({
    // Formato antigo (flat) — mantido para retrocompatibilidade
    ingest: publicProcedure
      .input(z.object({
        codigoSerial: z.string(),
        idDispositivo: z.number().optional(),
        idUsuario: z.number().optional(),
        frequenciaCardiaca: z.number().optional(),
        oxigenacaoSpo2: z.number().optional(),
        temperaturaCorporal: z.string().optional(),
        acelerometroX: z.string().optional(),
        acelerometroY: z.string().optional(),
        acelerometroZ: z.string().optional(),
        giroscopioX: z.string().optional(),
        giroscopioY: z.string().optional(),
        giroscopioZ: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        nivelBateria: z.number().optional(),
        quedaDetectada: z.boolean().optional(),
        timestampSensor: z.date().optional(),
        payload: z.any().optional(),
      }))
      .mutation(async ({ input }) => {
        let idDispositivo = input.idDispositivo;
        if (!idDispositivo) {
          const disp = await getDispositivoBySerial(input.codigoSerial);
          if (!disp) throw new TRPCError({ code: "NOT_FOUND", message: "Dispositivo não encontrado." });
          idDispositivo = disp.id;
          if (input.nivelBateria !== undefined) {
            await updateDispositivo(idDispositivo, {
              nivelBateria: input.nivelBateria,
              statusConexao: "Online",
              tempoUltimoSinal: "Agora",
            });
          }
        }
        await ingestLeitura({
          idDispositivo,
          idUsuario: input.idUsuario,
          frequenciaCardiaca: input.frequenciaCardiaca,
          oxigenacaoSpo2: input.oxigenacaoSpo2,
          temperaturaCorporal: input.temperaturaCorporal,
          acelerometroX: input.acelerometroX,
          acelerometroY: input.acelerometroY,
          acelerometroZ: input.acelerometroZ,
          giroscopioX: input.giroscopioX,
          giroscopioY: input.giroscopioY,
          giroscopioZ: input.giroscopioZ,
          latitude: input.latitude,
          longitude: input.longitude,
          nivelBateria: input.nivelBateria,
          quedaDetectada: input.quedaDetectada ?? false,
          timestampSensor: input.timestampSensor,
          payload: input.payload,
        });
        return { success: true, idDispositivo };
      }),

    // Formato novo (JSON aninhado do colete IoT)
    ingestIot: publicProcedure
      .input(z.object({
        codigo_serial: z.string(),
        timestamp: z.string().optional(),
        sensores: z.object({
          frequencia_cardiaca: z.number().optional(),
          oxigenacao_spo2: z.number().optional(),
          temperatura_corporal: z.number().optional(),
          nivel_bateria: z.number().optional(),
          queda_detectada: z.boolean().optional(),
          acelerometro: z.object({
            x: z.number(), y: z.number(), z: z.number(),
          }).optional(),
          giroscopio: z.object({
            x: z.number(), y: z.number(), z: z.number(),
          }).optional(),
          gps: z.object({
            latitude: z.number(), longitude: z.number(),
          }).optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        const disp = await getDispositivoBySerial(input.codigo_serial);
        if (!disp) throw new TRPCError({ code: "NOT_FOUND", message: `Dispositivo ${input.codigo_serial} não encontrado.` });

        const idDispositivo = disp.id;
        const s = input.sensores;

        // Atualizar status do dispositivo
        await updateDispositivo(idDispositivo, {
          nivelBateria: s.nivel_bateria,
          statusConexao: "Online",
          tempoUltimoSinal: "Agora",
        });

        // Salvar leitura
        await ingestLeitura({
          idDispositivo,
          idUsuario: disp.idUsuario ?? undefined,
          frequenciaCardiaca: s.frequencia_cardiaca,
          oxigenacaoSpo2: s.oxigenacao_spo2,
          temperaturaCorporal: s.temperatura_corporal?.toString(),
          acelerometroX: s.acelerometro?.x?.toString(),
          acelerometroY: s.acelerometro?.y?.toString(),
          acelerometroZ: s.acelerometro?.z?.toString(),
          giroscopioX: s.giroscopio?.x?.toString(),
          giroscopioY: s.giroscopio?.y?.toString(),
          giroscopioZ: s.giroscopio?.z?.toString(),
          latitude: s.gps?.latitude?.toString(),
          longitude: s.gps?.longitude?.toString(),
          nivelBateria: s.nivel_bateria,
          quedaDetectada: s.queda_detectada ?? false,
          timestampSensor: input.timestamp ? new Date(input.timestamp) : undefined,
          payload: input,
        });

        // Criar evento se queda detectada
        if (s.queda_detectada && disp.idUsuario) {
          await createEventoSaude({
            idUsuario: disp.idUsuario,
            idDispositivo,
            categoriaEvento: "Queda",
            descricaoEvento: `Queda detectada pelo colete ${input.codigo_serial}. Alerta enviado.`,
            frequenciaCardiaca: s.frequencia_cardiaca,
            oxigenacaoSpo2: s.oxigenacao_spo2,
            temperaturaCorporal: s.temperatura_corporal?.toString(),
            quedasDetectadas: 1,
            localizacaoEndereco: s.gps ? `${s.gps.latitude}, ${s.gps.longitude}` : undefined,
            dataHoraRegistro: input.timestamp ? new Date(input.timestamp) : new Date(),
          });
        }

        return { success: true, idDispositivo, codigoSerial: input.codigo_serial };
      }),

    ultimas: publicProcedure
      .input(z.object({ idDispositivo: z.number(), limit: z.number().optional() }))
      .query(({ input }) => getUltimasLeituras(input.idDispositivo, input.limit)),

    ultimaPorUsuario: publicProcedure
      .input(z.object({ idUsuario: z.number() }))
      .query(({ input }) => getUltimaLeituraByUsuario(input.idUsuario)),

    // Histórico bruto de leituras por período
    historico: publicProcedure
      .input(z.object({ idUsuario: z.number(), dias: z.number().min(1).max(90).default(20) }))
      .query(({ input }) => getLeiturasHistorico(input.idUsuario, input.dias)),

    // Resumo diário (médias por dia) — ideal para gráficos
    resumoDiario: publicProcedure
      .input(z.object({ idUsuario: z.number(), dias: z.number().min(1).max(90).default(20) }))
      .query(({ input }) => getLeiturasResumoDiario(input.idUsuario, input.dias)),
  }),

  // ─── ADMIN KPIs ───────────────────────────────────────────────────────────
  admin: router({
    kpis: adminProcedure.query(async () => {
      const [totalUsuarios, coletesOnline, ticketsAbertos] = await Promise.all([
        countUsuarios(),
        countDispositivosOnline(),
        countTicketsAbertos(),
      ]);
      return {
        totalUsuarios,
        coletesOnline,
        ticketsAbertos,
        mrr: totalUsuarios * 149,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;

// ─── Handler REST para ingestão IoT (usado pelo Express diretamente) ────────
export async function handleIotIngest(body: any) {
  const serial = body.codigo_serial;
  if (!serial) throw new Error("codigo_serial é obrigatório");

  const disp = await getDispositivoBySerial(serial);
  if (!disp) throw new Error(`Dispositivo ${serial} não encontrado`);

  const s = body.sensores ?? {};
  const idDispositivo = disp.id;

  // Atualizar dispositivo
  await updateDispositivo(idDispositivo, {
    nivelBateria: s.nivel_bateria,
    statusConexao: "Online",
    tempoUltimoSinal: "Agora",
  });

  // Salvar leitura
  await ingestLeitura({
    idDispositivo,
    idUsuario: disp.idUsuario ?? undefined,
    frequenciaCardiaca: s.frequencia_cardiaca,
    oxigenacaoSpo2: s.oxigenacao_spo2,
    temperaturaCorporal: s.temperatura_corporal?.toString(),
    acelerometroX: s.acelerometro?.x?.toString(),
    acelerometroY: s.acelerometro?.y?.toString(),
    acelerometroZ: s.acelerometro?.z?.toString(),
    giroscopioX: s.giroscopio?.x?.toString(),
    giroscopioY: s.giroscopio?.y?.toString(),
    giroscopioZ: s.giroscopio?.z?.toString(),
    latitude: s.gps?.latitude?.toString(),
    longitude: s.gps?.longitude?.toString(),
    nivelBateria: s.nivel_bateria,
    quedaDetectada: s.queda_detectada ?? false,
    timestampSensor: body.timestamp ? new Date(body.timestamp) : undefined,
    payload: body,
  });

  // Evento de queda
  if (s.queda_detectada && disp.idUsuario) {
    await createEventoSaude({
      idUsuario: disp.idUsuario,
      idDispositivo,
      categoriaEvento: "Queda",
      descricaoEvento: `Queda detectada pelo colete ${serial}. Alerta enviado.`,
      frequenciaCardiaca: s.frequencia_cardiaca,
      oxigenacaoSpo2: s.oxigenacao_spo2,
      temperaturaCorporal: s.temperatura_corporal?.toString(),
      quedasDetectadas: 1,
      localizacaoEndereco: s.gps ? `${s.gps.latitude}, ${s.gps.longitude}` : undefined,
      dataHoraRegistro: body.timestamp ? new Date(body.timestamp) : new Date(),
    });
  }

  return { success: true, idDispositivo, codigoSerial: serial };
}
