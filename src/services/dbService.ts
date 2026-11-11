import initSqlJs, {type Database } from 'sql.js';
import { verbSeed, sentenceSeed, challengeSeed } from '../data/seeds';
import type { Verb, Sentence, Challenge, Score } from '../models/types';

let db: Database | null = null;

export const dbService = {
    // 1. Inicializar el motor SQL
    init: async () => {
        const SQL = await initSqlJs({
           locateFile: (file) => `/${file}` ,
        });
        db = new SQL.Database();
        console.log("SQL Engine Ready");
    },

    // 2. Inicializar Verbos
    initVerbs: () => {
        if (!db) return;
        db.run("CREATE TABLE IF NOT EXISTS verbs (id INTEGER PRIMARY KEY AUTOINCREMENT, spanish TEXT, english TEXT)");
        const count = db.exec("SELECT COUNT(*) FROM verbs")[0].values[0][0];
        if (Number(count) === 0) {
            db.run("BEGIN TRANSACTION");
            const stmt = db.prepare("INSERT INTO verbs (spanish, english) VALUES (?, ?)");
            verbSeed.forEach(v => stmt.run(v));
            stmt.free();
            db.run("COMMIT");
        }
    },

    // 3. Inicializar Frases
    initSentences: () => {
        if (!db) return;
        db.run("CREATE TABLE IF NOT EXISTS sentences (id INTEGER PRIMARY KEY AUTOINCREMENT, spanish TEXT, english TEXT)");
        const count = db.exec("SELECT COUNT(*) FROM sentences")[0].values[0][0];
        if (Number(count) === 0) {
            db.run("BEGIN TRANSACTION");
            const stmt = db.prepare("INSERT INTO sentences (spanish, english) VALUES (?, ?)");
            sentenceSeed.forEach(s => stmt.run(s));
            stmt.free();
            db.run("COMMIT");
        }
    },

    // 4. Inicializar Desafíos (Challenges)
    initChallenges: () => {
        if (!db) return;
        db.run("CREATE TABLE IF NOT EXISTS challenges (id INTEGER PRIMARY KEY AUTOINCREMENT, sentence TEXT, options TEXT, correct TEXT, spanish TEXT)");
        const count = db.exec("SELECT COUNT(*) FROM challenges")[0].values[0][0];
        if (Number(count) === 0) {
            db.run("BEGIN TRANSACTION");
            const stmt = db.prepare("INSERT INTO challenges (sentence, options, correct, spanish) VALUES (?, ?, ?, ?)");
            challengeSeed.forEach(c => stmt.run(c));
            stmt.free();
            db.run("COMMIT");
        }
    },

    // Métodos de obtención (Getters)
    getVerbs: (limit: number): Verb[] => {
        if (!db) return [];
        const res = db.exec(`SELECT id, spanish, english FROM verbs ORDER BY RANDOM() LIMIT ${limit}`);
        return res[0]?.values.map(r => ({ id: Number(r[0]), spanish: String(r[1]), english: String(r[2]) })) || [];
    },

    getSentences: (limit: number): Sentence[] => {
        if (!db) return [];
        const res = db.exec(`SELECT id, spanish, english FROM sentences ORDER BY RANDOM() LIMIT ${limit}`);
        return res[0]?.values.map(r => ({ id: Number(r[0]), spanish: String(r[1]), english: String(r[2]) })) || [];
    },

    getChallenges: (limit: number): Challenge[] => {
        if (!db) return [];
        const res = db.exec(`SELECT id, sentence, options, correct, spanish FROM challenges ORDER BY RANDOM() LIMIT ${limit}`);
        return res[0]?.values.map(r => ({
            id: Number(r[0]),
            sentence: String(r[1]),
            options: String(r[2]).split('|'),
            correct: String(r[3]),
            spanish: String(r[4])
        })) || [];
    },
    // Obtener historial de puntajes para la vista de estadísticas
    getScores: (): Score[] => {
        if (!db) return [];
        try {
            // Creamos la tabla si por alguna razón no existe para evitar el error
            db.run("CREATE TABLE IF NOT EXISTS scores (player TEXT, score INTEGER, date TEXT)");

            const res = db.exec("SELECT player, score, date FROM scores ORDER BY date DESC LIMIT 20");

            if (!res[0] || !res[0].values) return [];

            return res[0].values.map(r => ({
                player: String(r[0]),
                score: Number(r[1]),
                date: String(r[2])
            }));
        } catch (error) {
            console.error("Error al obtener puntuaciones:", error);
            return [];
        }
    },

    // Sistema de puntuación (Stats)
    saveScore: async (player: string, score: number) => {
        if (!db) return;
        db.run("CREATE TABLE IF NOT EXISTS scores (player TEXT, score INTEGER, date TEXT)");
        db.run("INSERT INTO scores VALUES (?, ?, ?)", [player, score, new Date().toISOString()]);
    }
};
