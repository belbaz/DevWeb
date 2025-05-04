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
                const table = Object.entries(results)[0]; // only the first table
                if (!table) return res.status(400).json({error: 'No data found'});

                const [tableName, rows] = table;

                const csv = [
                    Object.keys(rows[0]).join(","), // header
                    ...rows.map(row => Object.values(row).map(v =>
                        typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
                    ).join(","))
                ].join("\n");

                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="${tableName}.csv"`);
                return res.status(200).send(csv);
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