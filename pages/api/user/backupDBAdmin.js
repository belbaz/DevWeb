// pages/api/user/backupDBAdmin.js

import supabase from 'lib/supabaseClient';
import {getUserFromRequest} from "lib/getUserFromRequest";

export default async function backupDBAdmin(req, res) {

    try {
        // 1. get username
        const user = await getUserFromRequest(req);
        const username = user?.pseudo;
        const format = req.query.format || 'sql'; // default to SQL
        if (!username) {
            return res.status(401).json({error: 'User not authenticated'});
        }

        // console.log(user);
        // check is admin
        if (user?.level !== "expert") {
            return res.status(403).json({error: "You don't have permission to access this resource"});
        } else {
            const {data: results, error} = await supabase.rpc('getbackupdb');

            if (error) {
                console.error('Erreur Supabase RPC :', error);
                return res
                    .status(500)
                    .json({error: 'Error while backing up all data in db: ' + error.message});
            }

            if (format === 'json') {
                const jsonStr = JSON.stringify(results, null, 2);
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename="backup.json"');
                return res.status(200).send(jsonStr);
            }

            if (format === 'csv') {
                let csvContent = '';

                // Pour chaque table dans les résultats
                const tables = Object.entries(results);
                tables.forEach(([tableName, rows], tableIndex) => {
                    if (!Array.isArray(rows) || rows.length === 0) return;

                    // Ajouter le nom de la table avec une distinction claire
                    csvContent += `"TABLE: ${tableName}"\n`;

                    // Ajouter les en-têtes des colonnes
                    const headers = Object.keys(rows[0]);
                    csvContent += headers.map(h => `"${h}"`).join(',') + '\n';

                    // Ajouter toutes les lignes de données
                    rows.forEach(row => {
                        csvContent += Object.entries(row).map(([key, value]) => {
                            // Vérification si la valeur est un objet ou un tableau (potentiellement JSONB)
                            if (value !== null && (typeof value === 'object')) {
                                // Stringify proprement le contenu JSONB
                                try {
                                    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                                } catch (e) {
                                    return `"[Complex Data]"`;
                                }
                            } else if (typeof value === 'string') {
                                return `"${value.replace(/"/g, '""')}"`;
                            } else {
                                return value === null ? '""' : String(value);
                            }
                        }).join(',') + '\n';
                    });

                    // Ajouter une ligne vide entre les tables (sauf après la dernière)
                    if (tableIndex < tables.length - 1) {
                        csvContent += '\n';
                    }
                });

                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename="backup.csv"');
                return res.status(200).send(csvContent);
            }

            // Default: SQL format
            let sqlContent = '';
            for (const [table, rows] of Object.entries(results)) {
                if (!Array.isArray(rows)) continue;

                rows.forEach(row => {
                    const columns = Object.keys(row).map(col => `"${col}"`).join(", ");
                    const values = Object.values(row)
                        .map(val => {
                            if (val === null) return 'NULL';
                            if (typeof val === 'number') return val;
                            if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
                            return `'${val.toString().replace(/'/g, "''")}'`;
                        })
                        .join(", ");

                    sqlContent += `INSERT INTO "${table}" (${columns})
                                   VALUES (${values});  `;
                });
            }

            res.setHeader('Content-Type', 'application/sql');
            res.setHeader('Content-Disposition', 'attachment; filename="backup.sql"');
            return res.status(200).send(sqlContent);
        }
    } catch (e) {

    }
}