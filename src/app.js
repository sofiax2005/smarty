const appData = {
    users: [
        {
            id: "user_001",
            name: "John Doe",
            email: "john.doe@example.com",
            phone: "+91-9876543210",
            locality: "Connaught Place",
            city: "New Delhi",
            userType: "citizen",
            totalPoints: 2450,
            wasteStats: { totalScans: 47, thisMonth: 12, recycleRate: 78, co2Saved: 23.5 },
            biometricEnabled: true,
            learningProgress: { completedModules: 8, totalModules: 12, currentLevel: 3, badges: ["Eco Warrior", "Sorting Master", "Green Champion"], streakDays: 15 }
        },
        {
            id: "admin_001",
            name: "Sarah Administrative",
            email: "s.admin@ndmc.gov.in",
            userType: "municipal",
            department: "New Delhi Municipal Corporation",
            designation: "Waste Management Officer",
            permissions: ["analytics", "driver_management", "bin_monitoring", "alerts"]
        }
    ],
    bins: [
        { id: "BIN_CP_001", location: { latitude: 28.6315, longitude: 77.2167, address: "Block A, Connaught Place" }, fillLevel: 85, status: "warning", binType: "mixed_waste", batteryLevel: 67, qrCode: "SMARTBIN_CP_001_2025" },
        { id: "BIN_IG_002", location: { latitude: 28.6129, longitude: 77.2295, address: "India Gate Circle" }, fillLevel: 34, status: "active", binType: "recyclable", batteryLevel: 89, qrCode: "SMARTBIN_IG_002_2025" },
        { id: "BIN_RF_003", location: { latitude: 28.6562, longitude: 77.2410, address: "Red Fort" }, fillLevel: 92, status: "critical", binType: "organic", batteryLevel: 23, qrCode: "SMARTBIN_RF_003_2025" }
    ],
    drivers: [
        { id: "DRV_001_DEL", name: "Rajesh Kumar", phone: "+91-9876543211", vehicleNumber: "DL-1C-AB-1234", vehicleType: "Compactor Truck", status: "active", currentLocation: { latitude: 28.6315, longitude: 77.2167, address: "Connaught Place" }, todayStats: { collections: 12, kmTraveled: 45.2, fuelConsumed: 8.5, efficiency: 92, customerRating: 4.8 } },
        { id: "DRV_002_DEL", name: "Mohammed Ashraf", phone: "+91-9876543212", vehicleNumber: "DL-1C-CD-5678", vehicleType: "Collection Van", status: "on_break", currentLocation: { latitude: 28.6562, longitude: 77.2410, address: "Red Fort Area" }, todayStats: { collections: 8, kmTraveled: 32.1, fuelConsumed: 6.2, efficiency: 87, customerRating: 4.6 } }
    ],
    learningModules: [
        {
            id: "module_001",
            title: "Waste Segregation Fundamentals",
            type: "article",
            difficulty: "beginner",
            duration: 10,
            xpReward: 100,
            content: {
                sections: [
                    { type: "text", value: "Proper waste segregation is key to effective recycling. Separate waste into organic, recyclable, and hazardous categories." },
                    { type: "video", value: "https://example.com/waste-segregation-video.mp4" },
                    { type: "text", value: "Organic waste includes food scraps, while recyclables include plastic bottles and paper." }
                ]
            },
            userProgress: { completed: true, timeSpent: 8, currentStep: 3 }
        },
        {
            id: "module_002",
            title: "Home Composting Workshop",
            type: "interactive_simulation",
            difficulty: "intermediate",
            duration: 15,
            xpReward: 150,
            content: {
                sections: [
                    { type: "text", value: "Learn to compost at home with this interactive guide." },
                    { type: "simulation", value: { steps: ["Add brown materials", "Add green materials", "Mix and aerate"] } }
                ]
            },
            userProgress: { completed: false, currentStep: 1 }
        }
    ],
    schedulingSlots: {
        "2025-10-09": [{ time: "11:00-13:00", available: true, cost: { bulk_items: 150, electronics: 200, furniture: 300 } }]
    }
};

// App Context
const AppContext = React.createContext();

// Main App Component
function SmartBinApp() {
    const [state, setState] = React.useState({
        currentScreen: 'login-selection',
        currentUser: null,
        userType: null,
        isOnline: navigator.onLine,
        notifications: [],
        map: null,
        markers: [],
        currentMapFilter: 'all',
        charts: {},
        learningModule: null
    });

    // Initialize Google Maps
    React.useEffect(() => {
        window.initMap = () => {
            const map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: 28.6315, lng: 77.2167 },
                zoom: 14
            });
            const markers = appData.bins.map(bin => new google.maps.Marker({
                position: { lat: bin.location.latitude, lng: bin.location.longitude },
                map,
                title: bin.id,
                icon: bin.status === 'critical' ? '/critical.png' : bin.status === 'warning' ? '/warning.png' : '/active.png'
            }));
            setState(prev => ({ ...prev, map, markers }));
        };
    }, []);

    // Simulate real-time updates
    React.useEffect(() => {
        const interval = setInterval(() => {
            setState(prev => {
                const updatedBins = appData.bins.map(bin => {
                    const change = Math.floor(Math.random() * 8) - 2;
                    const fillLevel = Math.max(0, Math.min(100, bin.fillLevel + change));
                    return {
                        ...bin,
                        fillLevel,
                        status: fillLevel > 90 ? 'critical' : fillLevel > 75 ? 'warning' : 'active'
                    };
                });
                appData.bins = updatedBins;
                if (prev.map) {
                    prev.markers.forEach((marker, index) => {
                        marker.setIcon(updatedBins[index].status === 'critical' ? '/critical.png' : updatedBins[index].status === 'warning' ? '/warning.png' : '/active.png');
                    });
                }
                return { ...prev };
            });
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    // PWA Setup
    React.useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setState(prev => ({ ...prev, deferredPrompt: e }));
        });
        window.addEventListener('online', () => setState(prev => ({ ...prev, isOnline: true })));
        window.addEventListener('offline', () => setState(prev => ({ ...prev, isOnline: false })));
    }, []);

    // Helper Functions
    const showToast = (message, type) => {
        const toast = { id: Date.now(), message, type };
        setState(prev => ({ ...prev, notifications: [...prev.notifications, toast] }));
        setTimeout(() => setState(prev => ({
            ...prev,
            notifications: prev.notifications.filter(n => n.id !== toast.id)
        })), 3000);
    };

    const login = (userType, email, password) => {
        const user = appData.users.find(u => u.email === email && u.userType === userType);
        if (user) {
            setState(prev => ({
                ...prev,
                currentUser: user,
                userType,
                currentScreen: userType === 'citizen' ? 'user-dashboard' : 'municipal-dashboard'
            }));
            localStorage.setItem('user', JSON.stringify(user));
            showToast('Logged in successfully', 'success');
        } else {
            showToast('Invalid credentials', 'error');
        }
    };

    const logout = () => {
        setState(prev => ({
            ...prev,
            currentUser: null,
            userType: null,
            currentScreen: 'login-selection',
            learningModule: null
        }));
        localStorage.removeItem('user');
        showToast('Logged out successfully', 'success');
    };

    const startLearningModule = (moduleId) => {
        const module = appData.learningModules.find(m => m.id === moduleId);
        if (module) {
            setState(prev => ({ ...prev, learningModule: module, currentScreen: 'learning' }));
        } else {
            showToast('Module not found', 'error');
        }
    };

    const completeLearningStep = (moduleId, step) => {
        const module = appData.learningModules.find(m => m.id === moduleId);
        if (module && !module.userProgress.completed) {
            module.userProgress.currentStep = step + 1;
            if (module.userProgress.currentStep >= module.content.sections.length) {
                module.userProgress.completed = true;
                const user = appData.users.find(u => u.id === state.currentUser.id);
                user.totalPoints += module.xpReward;
                user.learningProgress.completedModules += 1;
            }
            localStorage.setItem('learningProgress', JSON.stringify(appData.learningModules));
            setState(prev => ({ ...prev, currentUser: { ...prev.currentUser } }));
            showToast('Progress saved', 'success');
        }
    };

    const contextValue = { state, setState, login, logout, showToast, startLearningModule, completeLearningStep };

    // Render Components
    return (
        <AppContext.Provider value={contextValue}>
            <div className="min-h-screen bg-cream-50">
                {state.isOnline ? null : (
                    <div className="toast bg-warning text-white">
                        📡 You're offline. Some features may be limited.
                    </div>
                )}
                {state.notifications.map(n => (
                    <div key={n.id} className={`toast bg-${n.type === 'success' ? 'success' : n.type === 'error' ? 'error' : 'primary'} text-cream-50`}>
                        {n.message}
                    </div>
                ))}
                {state.currentScreen === 'login-selection' && <LoginSelection />}
                {state.currentScreen === 'citizen-login' && <CitizenLogin />}
                {state.currentScreen === 'user-dashboard' && <UserDashboard />}
                {state.currentScreen === 'municipal-dashboard' && <MunicipalDashboard />}
                {state.currentScreen === 'learning' && <LearningModule />}
                {state.currentScreen === 'map' && <MapView />}
            </div>
        </AppContext.Provider>
    );
}

// Login Selection Component
function LoginSelection() {
    const { setState } = React.useContext(AppContext);
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-center mb-6">🗂️ SmartBin</h1>
            <p className="text-center text-slate-500 mb-6">Choose your login type to continue</p>
            <div className="flex flex-col gap-4 max-w-md mx-auto">
                <button
                    onClick={() => setState(prev => ({ ...prev, currentScreen: 'citizen-login', userType: 'citizen' }))}
                    className="glassmorphic p-4 rounded-lg hover:bg-teal-600 transition"
                >
                    <span className="text-xl">👤 Citizen Login</span>
                    <p className="text-slate-500">Access your dashboard, scan QR codes, and earn rewards</p>
                </button>
                <button
                    onClick={() => setState(prev => ({ ...prev, currentScreen: 'citizen-login', userType: 'municipal' }))}
                    className="glassmorphic p-4 rounded-lg hover:bg-teal-600 transition"
                >
                    <span className="text-xl">🏛️ Municipal Login</span>
                    <p className="text-slate-500">Monitor bins, manage drivers, and view analytics</p>
                </button>
            </div>
        </div>
    );
}

// Citizen Login Component
function CitizenLogin() {
    const { login, setState, state } = React.useContext(AppContext);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const handleLogin = () => {
        login(state.userType, email, password);
    };

    return (
        <div className="container mx-auto p-4">
            <button
                onClick={() => setState(prev => ({ ...prev, currentScreen: 'login-selection' }))}
                className="text-teal-500 mb-4"
            >
                ← Back
            </button>
            <h2 className="text-2xl font-semibold mb-6">{state.userType === 'municipal' ? 'Municipal' : 'Citizen'} Login</h2>
            <div className="flex flex-col gap-4 max-w-md mx-auto">
                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                    onClick={handleLogin}
                    className="bg-teal-500 text-cream-50 p-2 rounded-lg hover:bg-teal-600"
                >
                    Sign In
                </button>
                <button
                    onClick={() => state.showToast('Biometric login not supported in web demo', 'info')}
                    className="text-teal-500"
                >
                    🔐 Use Biometric Login
                </button>
                <button
                    onClick={() => state.showToast('Password reset link sent', 'info')}
                    className="text-teal-500"
                >
                    Forgot Password?
                </button>
            </div>
        </div>
    );
}

// User Dashboard Component
function UserDashboard() {
    const { state, showToast, startLearningModule, logout } = React.useContext(AppContext);
    const user = state.currentUser;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">SmartBin</h1>
                <button onClick={logout} className="text-teal-500">↩️ Logout</button>
            </div>
            <div className="glassmorphic p-4 rounded-lg mb-6">
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p>{user.locality}, {user.city}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="glassmorphic p-4 rounded-lg">
                    <span className="text-2xl">🏆</span>
                    <p>{user.totalPoints.toLocaleString()} Total Points</p>
                </div>
                <div className="glassmorphic p-4 rounded-lg">
                    <span className="text-2xl">📊</span>
                    <p>{user.wasteStats.totalScans} Total Scans</p>
                </div>
                <div className="glassmorphic p-4 rounded-lg">
                    <span className="text-2xl">♻️</span>
                    <p>{user.wasteStats.recycleRate}% Recycle Rate</p>
                </div>
                <div className="glassmorphic p-4 rounded-lg">
                    <span className="text-2xl">🌱</span>
                    <p>{user.wasteStats.co2Saved}kg CO₂ Saved</p>
                </div>
            </div>
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => showToast('QR Scanner opened', 'info')}
                        className="glassmorphic p-4 rounded-lg hover:bg-teal-600"
                    >
                        📱 Scan QR
                    </button>
                    <button
                        onClick={() => showToast('Photo ID opened', 'info')}
                        className="glassmorphic p-4 rounded-lg hover:bg-teal-600"
                    >
                        📸 Photo ID
                    </button>
                    <button
                        onClick={() => setState(prev => ({ ...prev, currentScreen: 'map' }))}
                        className="glassmorphic p-4 rounded-lg hover:bg-teal-600"
                    >
                        🗺️ Find Bins
                    </button>
                    <button
                        onClick={() => showToast('Rewards opened', 'success')}
                        className="glassmorphic p-4 rounded-lg hover:bg-teal-600"
                    >
                        🎁 Rewards
                    </button>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-4">📚 Learning Modules</h3>
                <div className="grid grid-cols-1 gap-4">
                    {appData.learningModules.map(module => (
                        <div key={module.id} className="glassmorphic p-4 rounded-lg">
                            <h4 className="text-lg font-semibold">{module.title}</h4>
                            <p>{module.type === 'article' ? 'Educational Article' : 'Interactive Simulation'}</p>
                            <p>⏱️ {module.duration} min • ⭐ {module.xpReward} XP</p>
                            <p>{module.userProgress.completed ? 'Completed' : `Progress: ${module.userProgress.currentStep}/${module.content.sections.length}`}</p>
                            <button
                                onClick={() => startLearningModule(module.id)}
                                className="bg-teal-500 text-cream-50 p-2 rounded-lg mt-2 hover:bg-teal-600"
                            >
                                {module.userProgress.completed ? 'Review' : 'Start'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Municipal Dashboard Component
function MunicipalDashboard() {
    const { state, logout, showToast } = React.useContext(AppContext);
    const [chart, setChart] = React.useState(null);

    React.useEffect(() => {
        const ctx = document.getElementById('performanceChart')?.getContext('2d');
        if (ctx) {
            const newChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [
                        { label: 'Efficiency', data: [85, 87, 89, 91, 88, 90, 92], borderColor: '#21808D' },
                        { label: 'Collections', data: [78, 82, 85, 88, 84, 87, 89], borderColor: '#A84B2F' }
                    ]
                },
                options: { responsive: true }
            });
            setChart(newChart);
            return () => newChart.destroy();
        }
    }, []);

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">🏛️ Municipal Dashboard</h1>
                <button onClick={logout} className="text-teal-500">↩️ Logout</button>
            </div>
            <div className="glassmorphic p-4 rounded-lg mb-6">
                <h2 className="text-xl font-semibold">{state.currentUser.name}</h2>
                <p>{state.currentUser.designation}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="glassmorphic p-4 rounded-lg">
                    <span className="text-2xl">🚛</span>
                    <p>{appData.drivers.length} Active Drivers</p>
                </div>
                <div className="glassmorphic p-4 rounded-lg">
                    <span className="text-2xl">🚨</span>
                    <p>{appData.bins.filter(b => b.status === 'critical').length} Critical Alerts</p>
                </div>
            </div>
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">🗺️ Live Driver Tracking</h3>
                <div id="map" className="h-96 w-full rounded-lg"></div>
            </div>
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">📈 Performance Analytics</h3>
                <div className="flex gap-2 mb-4">
                    {['Today', 'Week', 'Month'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => showToast(`Showing ${filter} analytics`, 'info')}
                            className={`p-2 rounded-lg ${state.currentMapFilter === filter.toLowerCase() ? 'bg-teal-500 text-cream-50' : 'bg-cream-100'}`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
                <canvas id="performanceChart" className="w-full h-64"></canvas>
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-4">🏆 Top Performers</h3>
                <div className="grid grid-cols-1 gap-4">
                    {appData.drivers.map(driver => (
                        <div key={driver.id} className="glassmorphic p-4 rounded-lg">
                            <h4 className="text-lg font-semibold">{driver.name}</h4>
                            <p>{driver.vehicleNumber} • Efficiency: {driver.todayStats.efficiency}%</p>
                            <p>Collections: {driver.todayStats.collections} • Rating: {driver.todayStats.customerRating}/5</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Learning Module Component
function LearningModule() {
    const { state, completeLearningStep, setState } = React.useContext(AppContext);
    const [currentStep, setCurrentStep] = React.useState(state.learningModule?.userProgress.currentStep || 0);

    const handleNext = () => {
        if (currentStep < state.learningModule.content.sections.length - 1) {
            setCurrentStep(currentStep + 1);
            completeLearningStep(state.learningModule.id, currentStep);
        } else {
            completeLearningStep(state.learningModule.id, currentStep);
            setState(prev => ({ ...prev, currentScreen: 'user-dashboard', learningModule: null }));
        }
    };

    const section = state.learningModule.content.sections[currentStep];

    return (
        <div className="container mx-auto p-4">
            <button
                onClick={() => setState(prev => ({ ...prev, currentScreen: 'user-dashboard', learningModule: null }))}
                className="text-teal-500 mb-4"
            >
                ← Back
            </button>
            <h2 className="text-2xl font-semibold mb-6">{state.learningModule.title}</h2>
            <div className="glassmorphic p-4 rounded-lg mb-6">
                {section.type === 'text' && <p className="text-slate-900">{section.value}</p>}
                {section.type === 'video' && (
                    <video controls className="w-full rounded-lg">
                        <source src={section.value} type="video/mp4" />
                    </video>
                )}
                {section.type === 'simulation' && (
                    <div>
                        <h3 className="text-lg font-semibold">Simulation Step {currentStep + 1}</h3>
                        <p>{section.value.steps[currentStep]}</p>
                    </div>
                )}
            </div>
            <div className="flex justify-between">
                <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    disabled={currentStep === 0}
                    className="p-2 rounded-lg bg-cream-100 disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    onClick={handleNext}
                    className="bg-teal-500 text-cream-50 p-2 rounded-lg hover:bg-teal-600"
                >
                    {currentStep === state.learningModule.content.sections.length - 1 ? 'Finish' : 'Next'}
                </button>
            </div>
        </div>
    );
}

// Map View Component
function MapView() {
    const { state, setState } = React.useContext(AppContext);

    return (
        <div className="container mx-auto p-4">
            <button
                onClick={() => setState(prev => ({ ...prev, currentScreen: state.userType === 'citizen' ? 'user-dashboard' : 'municipal-dashboard' }))}
                className="text-teal-500 mb-4"
            >
                ← Back
            </button>
            <h2 className="text-2xl font-semibold mb-6">🗺️ SmartBin Locations</h2>
            <div id="map" className="h-96 w-full rounded-lg mb-6"></div>
            <div className="flex gap-2 mb-4">
                {['All Bins', 'Active', 'Warning', 'Critical'].map(filter => (
                    <button
                        key={filter}
                        onClick={() => setState(prev => ({ ...prev, currentMapFilter: filter.toLowerCase() }))}
                        className={`p-2 rounded-lg ${state.currentMapFilter === filter.toLowerCase() ? 'bg-teal-500 text-cream-50' : 'bg-cream-100'}`}
                    >
                        {filter}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 gap-4">
                {appData.bins
                    .filter(bin => state.currentMapFilter === 'all bins' || bin.status === state.currentMapFilter)
                    .map(bin => (
                        <div key={bin.id} className="glassmorphic p-4 rounded-lg">
                            <h4 className="text-lg font-semibold">{bin.location.address}</h4>
                            <p>Status: {bin.status} • Fill: {bin.fillLevel}%</p>
                            <button
                                onClick={() => setState(prev => ({ ...prev, currentScreen: 'bin-details', selectedBin: bin }))}
                                className="text-teal-500"
                            >
                                View Details
                            </button>
                        </div>
                    ))}
            </div>
        </div>
    );
}

// Render App
ReactDOM.render(<SmartBinApp />, document.getElementById('root'));

// Global Google Maps callback
window.initMap = function() {
    // Handled in SmartBinApp useEffect
};
