"use client";

import React, {useEffect, useState} from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Tooltip,
    Legend,
    Title,
    Filler,
} from "chart.js";
import {Bar, Doughnut, Line} from "react-chartjs-2";
import {IoAnalyticsOutline, IoCalendarOutline, IoStatsChartOutline} from "react-icons/io5";
import Rolling from "../../components/rolling";
import {saveAs} from 'file-saver';
import ExcelJS from 'exceljs';
import {toast} from "react-toastify";

// Register all necessary elements for different chart types
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Title, Filler);

export default function UserActivityDashboard() {
    // États existants
    const [activityData, setActivityData] = useState(null);
    const [totalActions, setTotalActions] = useState(0);
    const [actionsByType, setActionsByType] = useState({});
    const [mostActiveDay, setMostActiveDay] = useState({date: null, count: 0});
    const [isLoading, setIsLoading] = useState(true);
    const [actionTypes, setActionTypes] = useState([]);

    // Ajout des nouveaux états pour les statistiques d'administrateur
    const [userStats, setUserStats] = useState({});
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeUsers, setActiveUsers] = useState(0);
    const [mostActiveUser, setMostActiveUser] = useState({pseudo: null, count: 0});
    const [data, setData] = useState([]);

    useEffect(() => {
        setIsLoading(true);

        const checkAuthAndFetch = async () => {
            try {
                const authCheck = await fetch("/api/user/checkUser", {
                    method: "POST",
                    credentials: "include",
                });

                const data = await authCheck.json();

                if (!data.level || data.level !== "expert") {
                    console.log(data.level);
                }

                // L'utilisateur est autorisé, on peut continuer ici
                const activityRes = await fetch("/api/user/getActivity", {
                    method: "GET",
                    credentials: "include",
                });

                const activityData = await activityRes.json();
                console.log("Activity data:", activityData);

                // Tu peux setState ici pour afficher les données
            } catch (error) {
                toast.error("An error occurred.");
                console.error("Error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthAndFetch();
    }, []);

    useEffect(() => {
        setIsLoading(true);
        fetch("/api/user/getActivity")
            .then((res) => res.json())
            .then((json) => {
                setData(json.data || []);
                console.log(json.data);
                const logs = json.data || [];

                // Déterminer si les données contiennent plusieurs utilisateurs
                const uniqueUsers = [...new Set(logs.map(log => log.pseudo))];
                const isAdminView = uniqueUsers.length > 1;
                setIsAdmin(isAdminView);
                setActiveUsers(uniqueUsers.length);

                // Générer les statistiques par utilisateur si c'est un admin
                if (isAdminView) {
                    const userActivity = {};
                    uniqueUsers.forEach(user => {
                        userActivity[user] = logs.filter(log => log.pseudo === user).length;
                    });

                    // Trouver l'utilisateur le plus actif
                    let maxUser = {pseudo: null, count: 0};
                    Object.entries(userActivity).forEach(([user, count]) => {
                        if (count > maxUser.count) {
                            maxUser = {pseudo: user, count};
                        }
                    });

                    setUserStats(userActivity);
                    setMostActiveUser(maxUser);
                }

                // Extraire les types d'actions uniques
                const uniqueTypes = [...new Set(logs.map(log => log.type))];
                setActionTypes(uniqueTypes);

                // Générer dynamiquement les couleurs
                const colors = {};
                const hoverColors = {};

                // Palette de couleurs
                const colorPalette = ["rgba(0, 123, 255, 0.8)", "rgba(40, 167, 69, 0.8)", "rgba(255, 193, 7, 0.8)", "rgba(255, 87, 34, 0.8)", "rgba(108, 117, 125, 0.8)", "rgba(23, 162, 184, 0.8)", "rgba(102, 16, 242, 0.8)", "rgba(0, 200, 83, 0.8)", "rgba(255, 99, 132, 0.8)", "rgba(220, 53, 69, 0.8)", "rgba(0, 123, 255, 0.8)", "rgba(255, 159, 64, 0.8)", "rgba(156, 39, 176, 0.8)"];

                uniqueTypes.forEach((type, index) => {
                    const colorIndex = index % colorPalette.length;
                    colors[type] = colorPalette[colorIndex];
                    hoverColors[type] = colorPalette[colorIndex].replace('0.8', '1');
                });

                // Groupe par date et type
                const grouped = {};
                const summary = {};
                let totalCount = 0;
                let maxDay = {date: null, count: 0};

                // Reste du code existant pour traiter les logs...
                logs.forEach((log) => {
                    const date = new Date(log.date).toISOString().split("T")[0];

                    // Pour le regroupement par date
                    if (!grouped[date]) grouped[date] = {};
                    grouped[date][log.type] = (grouped[date][log.type] || 0) + 1;

                    // Pour calculer le total par date
                    grouped[date].total = (grouped[date].total || 0) + 1;

                    // Pour les statistiques
                    summary[log.type] = (summary[log.type] || 0) + 1;
                    totalCount++;

                    // Trouver le jour le plus actif
                    if (grouped[date].total > maxDay.count) {
                        maxDay = {date, count: grouped[date].total};
                    }
                });

                // Trier les dates et préparer les données
                const dates = Object.keys(grouped).sort();

                // Préparer les données pour les graphiques
                const lineData = {
                    labels: dates, datasets: [{
                        label: "Total Actions per Day",
                        data: dates.map((date) => grouped[date].total || 0),
                        borderColor: "rgba(78, 115, 223, 1)",
                        backgroundColor: "rgba(78, 115, 223, 0.1)",
                        fill: true,
                        tension: 0.4,
                        pointRadius: 3,
                        pointBackgroundColor: "rgba(78, 115, 223, 1)",
                        pointBorderColor: "#fff",
                        pointHoverRadius: 5,
                    }]
                };

                const areaData = {
                    labels: dates, datasets: uniqueTypes.map((type) => ({
                        label: type,
                        data: dates.map((date) => grouped[date][type] || 0),
                        backgroundColor: colors[type],
                        hoverBackgroundColor: hoverColors[type],
                        borderColor: hoverColors[type],
                        borderWidth: 1,
                    })),
                };

                const doughnutData = {
                    labels: uniqueTypes, datasets: [{
                        data: uniqueTypes.map(type => summary[type] || 0),
                        backgroundColor: uniqueTypes.map(type => colors[type]),
                        hoverBackgroundColor: uniqueTypes.map(type => hoverColors[type]),
                        borderWidth: 2,
                        borderColor: "#161B22",
                    }]
                };

                // Mettre à jour l'état
                setActivityData({
                    lineData, areaData, doughnutData, colors,
                    hoverColors
                });
                setTotalActions(totalCount);
                setActionsByType(summary);
                setMostActiveDay(maxDay);
                setIsLoading(false);

                // Ajouter des données spécifiques pour la vue admin
                if (isAdminView) {
                    const userChartData = {
                        labels: uniqueUsers, datasets: [{
                            label: "Actions par utilisateur",
                            data: uniqueUsers.map(user => logs.filter(log => log.pseudo === user).length),
                            backgroundColor: uniqueUsers.map((_, i) => colorPalette[i % colorPalette.length]),
                            hoverBackgroundColor: uniqueUsers.map((_, i) => colorPalette[i % colorPalette.length].replace('0.8', '1')),
                            borderWidth: 1,
                        }]
                    };

                    // Analyser les types d'actions par utilisateur
                    const userActionTypes = {};
                    uniqueUsers.forEach(user => {
                        userActionTypes[user] = {};
                        uniqueTypes.forEach(type => {
                            userActionTypes[user][type] = logs.filter(log => log.pseudo === user && log.type === type).length;
                        });
                    });

                    // Mettre à jour activityData avec les données admin
                    setActivityData(prev => ({
                        ...prev, userChartData, userActionTypes
                    }));
                }

                setIsLoading(false);
            })
            .catch(err => {
                console.error("Error loading activity data:", err);
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return (<div className="dashboard-loading">
            <div className="spinner"></div>
            <p style={{paddingTop: "25px", fontSize: "25px"}}>Loading activity data...</p>
            {Rolling(50, 50, "#fff")}
        </div>);
    }

    const exportToExcel = async (data) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('User Activity');

        // Définir les colonnes avec des largeurs personnalisées
        worksheet.columns = [
            {header: 'ID', key: 'id', width: 10},
            {header: 'Type', key: 'type', width: 15},
            {header: 'Pseudo', key: 'pseudo', width: 20},
            {header: 'Date', key: 'date', width: 30},
            {header: 'Current Level', key: 'currentLevel', width: 20},
        ];

        // Ajouter les lignes à partir des données
        data.forEach(item => {
            worksheet.addRow({
                id: item.id,
                type: item.type,
                pseudo: item.pseudo,
                date: new Date(item.date).toLocaleString(),
                currentLevel: item.currentLevel ?? ''
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, 'user-activity.xlsx');
    };

    return (<div style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "2rem auto",
        backgroundColor: "#161B22",
        padding: "2rem",
        borderRadius: "16px",
        color: "white",
        fontFamily: "Inter, system-ui, sans-serif",
    }}>
        <h2 style={{
            textAlign: "center",
            marginBottom: "2rem",
            fontSize: "1.8rem",
            fontWeight: "600",
            background: "linear-gradient(90deg, #6e48aa, #9d50bb)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
        }}>
            <IoAnalyticsOutline style={{verticalAlign: "middle", marginRight: "10px"}}/>
            {isAdmin ? "Admin Dashboard - All Users Activity" : "User Activity Dashboard"}
        </h2>

        {/* Stats Cards */}
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "2rem"
        }}>
            <div style={{
                backgroundColor: "rgba(78, 115, 223, 0.1)",
                border: "1px solid rgba(78, 115, 223, 0.3)",
                borderRadius: "12px",
                padding: "1.5rem",
                textAlign: "center"
            }}>
                <h3 style={{fontSize: "1rem", color: "#ccc", marginBottom: "0.5rem"}}>Total Actions</h3>
                <p style={{fontSize: "2.5rem", fontWeight: "700", color: "#fff"}}>{totalActions}</p>
            </div>

            <div style={{
                backgroundColor: "rgba(75, 192, 192, 0.1)",
                border: "1px solid rgba(75, 192, 192, 0.3)",
                borderRadius: "12px",
                padding: "1.5rem",
                textAlign: "center"
            }}>
                <h3 style={{fontSize: "1rem", color: "#ccc", marginBottom: "0.5rem"}}>Most Active Day</h3>
                <p style={{fontSize: "1.5rem", fontWeight: "700", color: "#fff"}}>
                    {mostActiveDay.date ? new Date(mostActiveDay.date).toLocaleDateString() : "N/A"}
                </p>
                <p style={{fontSize: "1rem", color: "#ccc"}}>{mostActiveDay.count} actions</p>
            </div>

            <div style={{
                backgroundColor: "rgba(255, 159, 64, 0.1)",
                border: "1px solid rgba(255, 159, 64, 0.3)",
                borderRadius: "12px",
                padding: "1.5rem",
                textAlign: "center"
            }}>
                <h3 style={{fontSize: "1rem", color: "#ccc", marginBottom: "0.5rem"}}>Primary Action Type</h3>
                {activityData && (<p style={{fontSize: "1.5rem", fontWeight: "700", color: "#fff"}}>
                    {Object.entries(actionsByType).sort((a, b) => b[1] - a[1])[0]?.[0] || "login"}
                </p>)}
            </div>
        </div>

        {/* Section spécifique pour les administrateurs */}
        {isAdmin && activityData && (<div style={{
            backgroundColor: "rgba(22, 27, 34, 0.8)",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "2rem",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
            <h3 style={{fontSize: "1.2rem", marginBottom: "1rem", display: "flex", alignItems: "center"}}>
                <IoAnalyticsOutline style={{marginRight: "10px"}}/>
                Activity by User
            </h3>
            <div style={{height: "300px", maxWidth: "100%", overflow: "hidden"}}>
                <Bar
                    data={activityData.userChartData}
                    options={{
                        responsive: true, maintainAspectRatio: false, plugins: {
                            legend: {
                                display: false
                            }, tooltip: {
                                backgroundColor: "rgba(0, 0, 0, 0.8)",
                                titleFont: {size: 14},
                                bodyFont: {size: 13},
                                padding: 10,
                                cornerRadius: 6,
                            }
                        }, scales: {
                            x: {
                                grid: {display: false}, ticks: {
                                    color: "rgba(255, 255, 255, 0.7)"
                                }
                            }, y: {
                                grid: {color: "rgba(255, 255, 255, 0.05)"},
                                ticks: {color: "rgba(255, 255, 255, 0.7)"},
                                beginAtZero: true
                            }
                        }
                    }}
                />
            </div>
        </div>)}

        {/* Table showing user activity breakdown */}
        {isAdmin && activityData && (<div style={{
            backgroundColor: "rgba(22, 27, 34, 0.8)",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "2rem",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
            <h3 style={{fontSize: "1.2rem", marginBottom: "1rem"}}>User Activity Breakdown</h3>
            <div style={{overflowX: "auto"}}>
                <table style={{
                    width: "100%", borderCollapse: "collapse", color: "white", fontSize: "0.9rem"
                }}>
                    <thead>
                    <tr>
                        <th style={{
                            textAlign: "left",
                            padding: "0.75rem",
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                        }}>User
                        </th>
                        {actionTypes.map(type => (<th key={type} style={{
                            textAlign: "center",
                            padding: "0.75rem",
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                        }}>{type}</th>))}
                        <th style={{
                            textAlign: "center",
                            padding: "0.75rem",
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                        }}>Total
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {Object.keys(activityData.userActionTypes).map(user => (<tr key={user}>
                        <td style={{
                            padding: "0.75rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
                        }}>{user}</td>
                        {actionTypes.map(type => (<td key={`${user}-${type}`} style={{
                            textAlign: "center",
                            padding: "0.75rem",
                            borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
                        }}>{activityData.userActionTypes[user][type] || 0}</td>))}
                        <td style={{
                            textAlign: "center",
                            padding: "0.75rem",
                            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                            fontWeight: "bold"
                        }}>{userStats[user]}</td>
                    </tr>))}
                    </tbody>
                </table>
            </div>
        </div>)}

        {!isAdmin && (<>
            {/* Two-column layout for charts */}
            <div className="chart-container" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
                marginBottom: "2rem",
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box"
            }}>
                {/* Doughnut Chart */}
                <div style={{
                    backgroundColor: "rgba(22, 27, 34, 0.8)",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box"
                }}>
                    <h3 style={{
                        fontSize: "1.2rem", marginBottom: "1rem", display: "flex", alignItems: "center"
                    }}>
                        <IoStatsChartOutline style={{marginRight: "10px"}}/>
                        Action Type Distribution
                    </h3>
                    <div style={{
                        width: "100%",
                        maxWidth: "100%",
                        height: "clamp(200px, 40vw, 300px)",
                        display: "flex",
                        justifyContent: "center",
                        overflow: "hidden"
                    }}>
                        {activityData && (<Doughnut
                            data={activityData.doughnutData}
                            options={{
                                responsive: true, maintainAspectRatio: false, plugins: {
                                    legend: {
                                        position: window.innerWidth < 768 ? "bottom" : "right", labels: {
                                            color: "white",
                                            padding: 15,
                                            font: {size: 11},
                                            boxWidth: window.innerWidth < 768 ? 10 : 15
                                        }
                                    }, tooltip: {
                                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                                        titleFont: {size: 14},
                                        bodyFont: {size: 13},
                                        padding: 10,
                                        cornerRadius: 6,
                                        callbacks: {
                                            label: function (context) {
                                                const label = context.label || '';
                                                const value = context.raw || 0;
                                                const percentage = ((value / totalActions) * 100).toFixed(1);
                                                return `${label}: ${value} (${percentage}%)`;
                                            }
                                        }
                                    }
                                }, cutout: "65%"
                            }}
                        />)}
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="chart-container" style={{
                    backgroundColor: "rgba(22, 27, 34, 0.8)",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box"
                }}>
                    <h3 style={{
                        fontSize: "1.2rem", marginBottom: "1rem", display: "flex", alignItems: "center"
                    }}>
                        <IoAnalyticsOutline style={{marginRight: "10px"}}/>
                        Action Type Details
                    </h3>
                    <div style={{
                        width: "100%",
                        maxWidth: "100%",
                        height: "clamp(200px, 40vw, 300px)",
                        overflow: "hidden"
                    }}>
                        {activityData && (<Bar
                            data={activityData.areaData}
                            options={{
                                responsive: true, maintainAspectRatio: false, plugins: {
                                    legend: {
                                        display: true,
                                        position: "bottom",
                                        labels: {color: "white", padding: 15, font: {size: 11}}
                                    }, tooltip: {
                                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                                        titleFont: {size: 14},
                                        bodyFont: {size: 13},
                                        padding: 10,
                                        cornerRadius: 6,
                                    }
                                }, scales: {
                                    x: {
                                        stacked: true, grid: {display: false}, ticks: {
                                            color: "rgba(255, 255, 255, 0.7)",
                                            maxRotation: 45,
                                            minRotation: 45,
                                            font: {size: 10}
                                        }
                                    }, y: {
                                        stacked: true,
                                        grid: {color: "rgba(255, 255, 255, 0.05)"},
                                        ticks: {color: "rgba(255, 255, 255, 0.7)"},
                                        beginAtZero: true
                                    }
                                }, barPercentage: 0.7, categoryPercentage: 0.8,
                            }}
                        />)}
                    </div>
                </div>
            </div>

            {/* Line Chart */}
            <div className="chart-container" style={{
                backgroundColor: "rgba(22, 27, 34, 0.8)",
                borderRadius: "12px",
                padding: "1.5rem",
                marginBottom: "2rem",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box"
            }}>
                <h3 style={{fontSize: "1.2rem", marginBottom: "1rem", display: "flex", alignItems: "center"}}>
                    <IoCalendarOutline style={{marginRight: "10px"}}/>
                    Daily Activity Trend
                </h3>
                <div style={{
                    width: "100%",
                    maxWidth: "100%",
                    height: "clamp(200px, 40vw, 400px)",
                    overflow: "hidden"
                }}>
                    {activityData && (<Line
                        data={activityData.lineData}
                        options={{
                            responsive: true, maintainAspectRatio: false, plugins: {
                                legend: {
                                    display: true, labels: {color: "white", font: {size: 12}}
                                }, tooltip: {
                                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                                    titleFont: {size: 14},
                                    bodyFont: {size: 13},
                                    padding: 10,
                                    cornerRadius: 6,
                                },
                            }, scales: {
                                x: {
                                    grid: {color: "rgba(255, 255, 255, 0.05)"}, ticks: {
                                        color: "rgba(255, 255, 255, 0.7)",
                                        maxRotation: 45,
                                        minRotation: 45,
                                        font: {size: 10}
                                    }
                                }, y: {
                                    grid: {color: "rgba(255, 255, 255, 0.05)"},
                                    ticks: {color: "rgba(255, 255, 255, 0.7)"},
                                    beginAtZero: true
                                }
                            }
                        }}
                    />)}
                </div>
            </div>

            {/* Action Type Breakdown */}
            <div className="chart-container" style={{
                backgroundColor: "rgba(22, 27, 34, 0.8)",
                borderRadius: "12px",
                padding: "1.5rem",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box"
            }}>
                <h3 style={{fontSize: "1.2rem", marginBottom: "1rem"}}>Action Type Breakdown</h3>
                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px"
                }}>
                    {activityData && actionTypes.map(type => (<div key={type} style={{
                        backgroundColor: `${activityData.colors[type].replace('0.8', '0.2')}`,
                        border: `1px solid ${activityData.colors[type]}`,
                        borderRadius: "8px",
                        padding: "1rem",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    }}>
                        <h4 style={{
                            color: activityData.colors[type].replace('0.8', '1'), marginBottom: "0.5rem"
                        }}>
                            {type}
                        </h4>
                        <p style={{fontSize: "1.8rem", fontWeight: "700"}}>{actionsByType[type] || 0}</p>
                        <p style={{fontSize: "0.9rem", color: "#ccc"}}>
                            {totalActions > 0 ? ((actionsByType[type] || 0) / totalActions * 100).toFixed(1) : 0}%
                        </p>
                    </div>))}
                </div>
            </div>
        </>)}

        {isAdmin && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <button onClick={() => exportToExcel(data)}>
                    Export to Excel
                </button>
            </div>
        )}

        <div style={{marginTop: "2rem", textAlign: "center", fontSize: "0.9rem", color: "#aaa"}}>
            Last updated: {new Date().toLocaleString()}
        </div>
    </div>);
}