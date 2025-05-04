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

// Register all necessary elements for different chart types
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Tooltip,
    Legend,
    Title,
    Filler
);

const ACTION_TYPES = [
    "accountActivation",
    "login",
    "regularVisit",
    "expoVisit",
    "useAudioGuide",
    "takeTrain",
    "changeProfilePic",
    "addRoom",
    "updateRoom",
    "deleteRoom",
    "addObject",
    "updateObject",
    "deleteObject"
];

const COLORS = {
    accountActivation: "rgba(0, 123, 255, 0.8)",
    login: "rgba(40, 167, 69, 0.8)",
    regularVisit: "rgba(255, 193, 7, 0.8)",
    expoVisit: "rgba(255, 87, 34, 0.8)",
    useAudioGuide: "rgba(108, 117, 125, 0.8)",
    takeTrain: "rgba(23, 162, 184, 0.8)",
    changeProfilePic: "rgba(102, 16, 242, 0.8)",
    addRoom: "rgba(0, 200, 83, 0.8)",
    updateRoom: "rgba(255, 99, 132, 0.8)",
    deleteRoom: "rgba(220, 53, 69, 0.8)",
    addObject: "rgba(0, 123, 255, 0.8)",
    updateObject: "rgba(255, 159, 64, 0.8)",
    deleteObject: "rgba(156, 39, 176, 0.8)"
};

const HOVER_COLORS = {
    accountActivation: "rgba(0, 123, 255, 1)",
    login: "rgba(40, 167, 69, 1)",
    regularVisit: "rgba(255, 193, 7, 1)",
    expoVisit: "rgba(255, 87, 34, 1)",
    useAudioGuide: "rgba(108, 117, 125, 1)",
    takeTrain: "rgba(23, 162, 184, 1)",
    changeProfilePic: "rgba(102, 16, 242, 1)",
    addRoom: "rgba(0, 200, 83, 1)",
    updateRoom: "rgba(255, 99, 132, 1)",
    deleteRoom: "rgba(220, 53, 69, 1)",
    addObject: "rgba(0, 123, 255, 1)",
    updateObject: "rgba(255, 159, 64, 1)",
    deleteObject: "rgba(156, 39, 176, 1)"
};

export default function UserActivityDashboard() {
    const [activityData, setActivityData] = useState(null);
    const [totalActions, setTotalActions] = useState(0);
    const [actionsByType, setActionsByType] = useState({});
    const [mostActiveDay, setMostActiveDay] = useState({date: null, count: 0});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        fetch("/api/user/getActivity")
            .then((res) => res.json())
            .then((json) => {
                const logs = json.data || [];

                // Group by date and type
                const grouped = {};
                const summary = {};
                let totalCount = 0;
                let maxDay = {date: null, count: 0};

                logs.forEach((log) => {
                    const date = new Date(log.date).toISOString().split("T")[0];

                    // For date grouping
                    if (!grouped[date]) grouped[date] = {};
                    grouped[date][log.type] = (grouped[date][log.type] || 0) + 1;

                    // For calculating total by date
                    grouped[date].total = (grouped[date].total || 0) + 1;

                    // For statistics
                    summary[log.type] = (summary[log.type] || 0) + 1;
                    totalCount++;

                    // Find the most active day
                    if (grouped[date].total > maxDay.count) {
                        maxDay = {date, count: grouped[date].total};
                    }
                });

                // Sort dates and prepare data
                const dates = Object.keys(grouped).sort();

                // Prepare data for charts
                const lineData = {
                    labels: dates,
                    datasets: [
                        {
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
                        }
                    ]
                };

                const areaData = {
                    labels: dates,
                    datasets: ACTION_TYPES.map((type) => ({
                        label: type,
                        data: dates.map((date) => grouped[date][type] || 0),
                        backgroundColor: COLORS[type],
                        hoverBackgroundColor: HOVER_COLORS[type],
                        borderColor: HOVER_COLORS[type],
                        borderWidth: 1,
                    })),
                };

                const doughnutData = {
                    labels: ACTION_TYPES.map(type => type),
                    datasets: [
                        {
                            data: ACTION_TYPES.map(type => summary[type] || 0),
                            backgroundColor: Object.values(COLORS),
                            hoverBackgroundColor: Object.values(HOVER_COLORS),
                            borderWidth: 2,
                            borderColor: "#161B22",
                        }
                    ]
                };

                // Update state
                setActivityData({
                    lineData,
                    areaData,
                    doughnutData
                });
                setTotalActions(totalCount);
                setActionsByType(summary);
                setMostActiveDay(maxDay);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Error loading activity data:", err);
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p style={{paddingTop: "25px", fontSize: "25px"}}>Loading activity data...</p>
                {Rolling(50, 50, "#fff")}
            </div>
        );
    }

    return (
        <div style={{
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
                User Activity Dashboard
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
                    {activityData && (
                        <p style={{fontSize: "1.5rem", fontWeight: "700", color: "#fff"}}>
                            {
                                Object.entries(actionsByType).sort((a, b) => b[1] - a[1])[0]?.[0] || "login"
                            }
                        </p>
                    )}
                </div>
            </div>

            {/* Two-column layout for charts */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
                gap: "20px",
                marginBottom: "2rem"
            }}>
                {/* Doughnut Chart */}
                <div style={{
                    backgroundColor: "rgba(22, 27, 34, 0.8)",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.1)"
                }}>
                    <h3 style={{fontSize: "1.2rem", marginBottom: "1rem", display: "flex", alignItems: "center"}}>
                        <IoStatsChartOutline style={{marginRight: "10px"}}/>
                        Action Type Distribution
                    </h3>
                    <div style={{height: "300px", display: "flex", justifyContent: "center"}}>
                        {activityData && (
                            <Doughnut
                                data={activityData.doughnutData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: window.innerWidth < 768 ? "bottom" : "right",
                                            labels: {
                                                color: "white",
                                                padding: 15,
                                                font: {size: 11},
                                                boxWidth: window.innerWidth < 768 ? 10 : 15
                                            }
                                        },
                                        tooltip: {
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
                                    },
                                    cutout: "65%"
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Bar Chart */}
                <div style={{
                    backgroundColor: "rgba(22, 27, 34, 0.8)",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.1)"
                }}>
                    <h3 style={{fontSize: "1.2rem", marginBottom: "1rem", display: "flex", alignItems: "center"}}>
                        <IoAnalyticsOutline style={{marginRight: "10px"}}/>
                        Action Type Details
                    </h3>
                    <div style={{height: "300px"}}>
                        {activityData && (
                            <Bar
                                data={activityData.areaData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: true,
                                            position: "bottom",
                                            labels: {color: "white", padding: 15, font: {size: 11}}
                                        },
                                        tooltip: {
                                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                                            titleFont: {size: 14},
                                            bodyFont: {size: 13},
                                            padding: 10,
                                            cornerRadius: 6,
                                        }
                                    },
                                    scales: {
                                        x: {
                                            stacked: true,
                                            grid: {display: false},
                                            ticks: {
                                                color: "rgba(255, 255, 255, 0.7)",
                                                maxRotation: 45,
                                                minRotation: 45,
                                                font: {size: 10}
                                            }
                                        },
                                        y: {
                                            stacked: true,
                                            grid: {color: "rgba(255, 255, 255, 0.05)"},
                                            ticks: {color: "rgba(255, 255, 255, 0.7)"},
                                            beginAtZero: true
                                        }
                                    },
                                    barPercentage: 0.7,
                                    categoryPercentage: 0.8,
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Line Chart */}
            <div style={{
                backgroundColor: "rgba(22, 27, 34, 0.8)",
                borderRadius: "12px",
                padding: "1.5rem",
                marginBottom: "2rem",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
                <h3 style={{fontSize: "1.2rem", marginBottom: "1rem", display: "flex", alignItems: "center"}}>
                    <IoCalendarOutline style={{marginRight: "10px"}}/>
                    Daily Activity Trend
                </h3>
                {activityData && (
                    <Line
                        data={activityData.lineData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: true,
                            plugins: {
                                legend: {
                                    display: true,
                                    labels: {color: "white", font: {size: 12}}
                                },
                                tooltip: {
                                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                                    titleFont: {size: 14},
                                    bodyFont: {size: 13},
                                    padding: 10,
                                    cornerRadius: 6,
                                },
                            },
                            scales: {
                                x: {
                                    grid: {color: "rgba(255, 255, 255, 0.05)"},
                                    ticks: {
                                        color: "rgba(255, 255, 255, 0.7)",
                                        maxRotation: 45,
                                        minRotation: 45,
                                        font: {size: 10}
                                    }
                                },
                                y: {
                                    grid: {color: "rgba(255, 255, 255, 0.05)"},
                                    ticks: {color: "rgba(255, 255, 255, 0.7)"},
                                    beginAtZero: true
                                }
                            }
                        }}
                    />
                )}
            </div>


            {/* Action Type Details */}
            <div style={{
                backgroundColor: "rgba(22, 27, 34, 0.8)",
                borderRadius: "12px",
                padding: "1.5rem",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
                <h3 style={{fontSize: "1.2rem", marginBottom: "1rem"}}>Action Type Breakdown</h3>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "15px"
                }}>
                    {ACTION_TYPES.map(type => (
                        <div key={type} style={{
                            backgroundColor: `${COLORS[type].replace('0.8', '0.2')}`,
                            border: `1px solid ${COLORS[type]}`,
                            borderRadius: "8px",
                            padding: "1rem",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center"
                        }}>
                            <h4 style={{color: COLORS[type].replace('0.8', '1'), marginBottom: "0.5rem"}}>
                                {type}
                            </h4>
                            <p style={{fontSize: "1.8rem", fontWeight: "700"}}>{actionsByType[type] || 0}</p>
                            <p style={{fontSize: "0.9rem", color: "#ccc"}}>
                                {totalActions > 0 ? ((actionsByType[type] || 0) / totalActions * 100).toFixed(1) : 0}%
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{marginTop: "2rem", textAlign: "center", fontSize: "0.9rem", color: "#aaa"}}>
                Last updated: {new Date().toLocaleString()}
            </div>
        </div>
    );
}