     const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwWd0anCYbSTn5wpuuwVEuVXyCPtX1EjMXyXEC5i_qy7C1aE-I9LD1yq8i12e4Gi2COVg/exec'; 
     //

     //https://script.google.com/macros/s/AKfycbxs-TSmiA79gm-hj8ORfTwYXqlGxv0GzbGvFRdgEQaqW9PW4SufkF05ncwxJxaXxqWFSA/exec
     //https://script.google.com/macros/s/AKfycbze9ZZuYZDSjXPHmBnz4raBicz86ivqbC2Onu-ikF0HrjWb_lZMl_Rsq7eBKZi1eUgCcg/exec
     //https://script.google.com/macros/s/AKfycbwdg6fas0nicxWrG5bEpksmQUSCMvp742WpyCYdeODSl1zpGVGbHxtfIA79Kxdj6OvpRQ/exec
     //https://script.google.com/macros/s/AKfycbw5R2Y75epAPoYN0-rh48Eh9b7likvro-vqw5FzBoDcY2RcreOZ-OxTEVWOnAHnPeaGlw/exec
     //https://script.google.com/macros/s/AKfycbxbSOdVZaiHQ0wF2WDb-wKOdKXMamjhO--MDtSGKwAH-Zs0AC9GghJ-iSnN0VmYNZeWCQ/exec
     //https://script.google.com/macros/s/AKfycby3DFDlUZoStEyq7BFEuiD_gYpUd2US1I5GTxZ12USxbTbeQRsrxm1SU6QoFt1YykRz4g/exec
     //https://script.google.com/macros/s/AKfycby9dcky8TMc8tfmwjekbifVrhgvQD2Lk2PaWXAcZ8XoEJK-ie7YtCguf1f_ov_JjifECA/exec
      //'https://script.google.com/macros/s/AKfycbwLUWJs-PhULiqDi6zbNctVZGqzitqXEViBBEDRQbQVUvdta0HWxTRj2Q4_nCUtxSzY9g/exec'; 
  const mobileToggle = document.getElementById('mobileToggle');
    const sidebar = document.querySelector('.sidebar');
    
    // Crear botón móvil si no existe
    if (!mobileToggle) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'mobile-toggle hidden';
        toggleBtn.id = 'mobileToggle';
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.appendChild(toggleBtn);
    }
    
    const mobileToggleBtn = document.getElementById('mobileToggle');
    
    if (mobileToggleBtn && sidebar) {
        // Verificar ancho de pantalla
        function checkMobile() {
            if (window.innerWidth <= 992) {
                mobileToggleBtn.classList.remove('hidden');
            } else {
                mobileToggleBtn.classList.add('hidden');
                sidebar.classList.remove('active');
            }
        }
        
        // Inicializar
        checkMobile();
        
        // Redimensionamiento
        window.addEventListener('resize', checkMobile);
        
        // Toggle del menú
        mobileToggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 992 && 
                sidebar.classList.contains('active') &&
                !sidebar.contains(e.target) && 
                !mobileToggleBtn.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });
        
        // Cerrar menú al hacer clic en enlace
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 992) {
                    sidebar.classList.remove('active');
                }
            });
        });
    }
    
    // Optimizar tablas para móviles
    function optimizeTablesForMobile() {
        const tableContainers = document.querySelectorAll('.data-table-container');
        
        tableContainers.forEach(container => {
            const table = container.querySelector('.data-table');
            const hint = container.querySelector('.scroll-hint');
            
            if (table && window.innerWidth <= 768) {
                // Mostrar hint de scroll
                if (hint) {
                    hint.classList.remove('hidden');
                }
                
                // Verificar si la tabla es más ancha que el contenedor
                const tableWidth = table.scrollWidth;
                const containerWidth = container.clientWidth;
                
                if (tableWidth > containerWidth && hint) {
                    hint.classList.remove('hidden');
                } else if (hint) {
                    hint.classList.add('hidden');
                }
            } else if (hint) {
                // Ocultar hint en pantallas grandes
                hint.classList.add('hidden');
            }
        });
    }
    
    // Inicializar optimización de tablas
    optimizeTablesForMobile();
    
    // Re-optimizar al redimensionar
    window.addEventListener('resize', optimizeTablesForMobile);
    
    // Re-optimizar después de cargar datos en tablas
    const originalLoadInventario = window.loadInventario;
    if (originalLoadInventario) {
        window.loadInventario = async function() {
            await originalLoadInventario();
            setTimeout(optimizeTablesForMobile, 100);
        };
    }
    
    // Ajustar botones para evitar texto desbordado
    function adjustButtons() {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            const text = btn.textContent || btn.innerText;
            if (text.length > 30) {
                btn.style.fontSize = '0.8rem';
                btn.style.padding = 'var(--space-2) var(--space-3)';
            }
        });
    }
    
    // Ajustar después de cargar la página
    setTimeout(adjustButtons, 500);
     
    let productDataCache = {};
    let inventarioDataCache = [];
    let lotesDataCache = [];
    let detalleVentasDataCache = [];
    let resumenFinancieroChart, tendenciasChart;
    let appInitialized = false;

    const AUTH_USERNAME = 'admin';
    const AUTH_PASSWORD = '77128966';
    const AUTH_STORAGE_KEY = 'inventarioSavedCredentials';

    document.addEventListener('DOMContentLoaded', () => {
        initializeAuth();
    });

    function initializeAuth() {
        const loginForm = document.getElementById('loginForm');
        const rememberCheckbox = document.getElementById('rememberDevice');
        const loginUserInput = document.getElementById('loginUser');
        const loginPasswordInput = document.getElementById('loginPassword');
        const savedCredentials = getSavedCredentials();

        if (loginForm && loginForm.dataset.authBound !== 'true') {
            loginForm.addEventListener('submit', handleLogin);
            loginForm.dataset.authBound = 'true';
        }

        if (savedCredentials) {
            loginUserInput.value = savedCredentials.username || '';
            loginPasswordInput.value = savedCredentials.password || '';
            rememberCheckbox.checked = true;

            if (savedCredentials.username === AUTH_USERNAME && savedCredentials.password === AUTH_PASSWORD) {
                unlockApplication();
                return;
            }
        }

        lockApplication();
    }

    function handleLogin(event) {
        event.preventDefault();
        const username = String(document.getElementById('loginUser').value || '').trim();
        const password = String(document.getElementById('loginPassword').value || '');
        const rememberDevice = document.getElementById('rememberDevice').checked;

        if (username === AUTH_USERNAME && password === AUTH_PASSWORD) {
            if (rememberDevice) {
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ username, password }));
            } else {
                localStorage.removeItem(AUTH_STORAGE_KEY);
            }

            setAuthStatus('success', 'Ingreso correcto. Bienvenido.');
            unlockApplication();
            return;
        }

        setAuthStatus('error', 'Usuario o contraseña incorrectos.');
    }

    function getSavedCredentials() {
        try {
            const raw = localStorage.getItem(AUTH_STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (_) {
            return null;
        }
    }

    function lockApplication() {
        document.body.classList.add('auth-locked');
        const authOverlay = document.getElementById('authOverlay');
        authOverlay.classList.remove('hidden');
        const userInput = document.getElementById('loginUser');
        if (userInput) userInput.focus();
    }

    function unlockApplication() {
        document.body.classList.remove('auth-locked');
        const authOverlay = document.getElementById('authOverlay');
        authOverlay.classList.add('hidden');
        setAuthStatus('success', '');
        initializeApp();
    }

    function initializeApp() {
        if (appInitialized) return;
        setupNavigation();
        loadInitialData();
        setupForms();
        appInitialized = true;
    }

    function closeSession() {
        lockApplication();
        const passwordInput = document.getElementById('loginPassword');
        const rememberDevice = document.getElementById('rememberDevice');
        if (!rememberDevice.checked) {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
        if (passwordInput && !rememberDevice.checked) {
            passwordInput.value = '';
        }
    }

    function setAuthStatus(type, message) {
        const statusEl = document.getElementById('authStatus');
        if (!statusEl) return;

        if (!message) {
            statusEl.style.display = 'none';
            statusEl.textContent = '';
            return;
        }

        statusEl.style.display = 'block';
        statusEl.className = `status-message ${type}`;
        statusEl.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'times'}-circle"></i> ${message}`;
    }
        
        function setupNavigation() {
            const navLinks = document.querySelectorAll('.sidebar-nav a');
            const sections = document.querySelectorAll('.main-content .content-section');
            
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('data-section');

                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');

                    sections.forEach(section => {
                        if (section.id === targetId) {
                            section.classList.add('active');
                            if (targetId === 'dashboard') {
                                handleLoadDashboard();
                            } else if (targetId === 'inventario') {
                                document.getElementById('cargarInventarioBtn').click();
                            }
                        } else {
                            section.classList.remove('active');
                        }
                    });
                });
            });
        }

        async function loadInitialData() {
            try {
                const response = await fetch(`${SCRIPT_URL}?action=getCategorias`);
                const data = await response.json();
                
                if (data.status === 'success') {
                    populateCategories(data.data);
                } else {
                    displayStatus('statusProducto', 'warning', `No se pudieron cargar las categorías: ${data.message}.`);
                    populateCategories([]);
                }
            } catch (error) {
                displayStatus('statusProducto', 'error', `Error de conexión al cargar categorías.`);
                populateCategories([]);
            }
        }

        function populateCategories(categories) {
            const selectProducto = document.getElementById('p_categoria');
            selectProducto.innerHTML = '';
            
            if (categories.length === 0) {
                selectProducto.innerHTML = '<option value="" disabled selected>No hay categorías registradas</option>';
                document.getElementById('listaCategorias').innerHTML = '<li>No hay categorías.</li>';
                return;
            }

            selectProducto.innerHTML = '<option value="" disabled selected>Seleccione una categoría</option>';
            
            const listHtml = categories.map(cat => {
                const name = cat.nombre || `(ID ${cat.id})`;
                selectProducto.innerHTML += `<option value="${name}">${name}</option>`;
                return `<li>ID: ${cat.id} | Nombre: ${name}</li>`;
            }).join('');
            
            document.getElementById('listaCategorias').innerHTML = listHtml;
        }

        function setupForms() {
            // Configuración
            document.getElementById('iniciarDBBtn').addEventListener('click', () => handleConfigAction('iniciar'));
            document.getElementById('resetDBBtn').addEventListener('click', () => {
                if (window.confirm("¡ADVERTENCIA! ¿Deseas RESETEAR TODA la base de datos? Esto es irreversible.")) {
                    handleConfigAction('resetear');
                }
            });
            document.getElementById('logoutBtn').addEventListener('click', closeSession);

            // Categorías y Productos
            document.getElementById('categoriaForm').addEventListener('submit', (e) => handlePostAction(e, 'agregarCategoria', 'statusCategoria'));
            document.getElementById('productoForm').addEventListener('submit', (e) => handlePostAction(e, 'agregarProducto', 'statusProducto'));
            document.getElementById('p_forma_compra').addEventListener('change', updateProductReference);
            ['p_cantidad_unidades', 'p_costo_unitario', 'p_cantidad_empaque', 'p_unidades_empaque', 'p_precio_empaque', 'p_margen'].forEach(id => {
                document.getElementById(id).addEventListener('input', updateProductReference);
            });
            updateProductReference();
            
            // Compras/Ventas
            document.getElementById('co_query').addEventListener('input', (e) => handleQueryFilter(e.target.value, 'co'));
            document.getElementById('v_query').addEventListener('input', (e) => handleQueryFilter(e.target.value, 'v'));
            // Lectura QR y codigo de barras desactivada temporalmente.
            // setupQrScanner('co');
            // setupQrScanner('v');
            
            document.getElementById('compraForm').addEventListener('submit', (e) => handleTransactionPost(e, 'compra'));
            document.getElementById('ventaForm').addEventListener('submit', (e) => handleTransactionPost(e, 'venta'));

            // Resúmenes
            document.getElementById('resumenVentasBtn').addEventListener('click', () => loadSummary('Ventas'));
            document.getElementById('resumenComprasBtn').addEventListener('click', () => loadSummary('Compras'));

            // Dashboard
            document.getElementById('cargarInventarioBtn').addEventListener('click', loadInventario);
            ['inventarioSearch', 'inventarioDesde', 'inventarioHasta', 'inventarioStock'].forEach(id => {
                document.getElementById(id).addEventListener('input', applyInventoryFilters);
                document.getElementById(id).addEventListener('change', applyInventoryFilters);
            });
            document.getElementById('limpiarFiltrosInventario').addEventListener('click', clearInventoryFilters);
            document.getElementById('cargarMovimientosBtn').addEventListener('click', loadMovimientos);
            document.getElementById('cargarLotesBtn').addEventListener('click', loadLotes);
            document.getElementById('cargarDetalleVentasBtn').addEventListener('click', loadDetalleVentas);
            ['lotesSearch', 'lotesDesde', 'lotesHasta', 'lotesEstado'].forEach(id => {
                document.getElementById(id).addEventListener('input', applyLotesFilters);
                document.getElementById(id).addEventListener('change', applyLotesFilters);
            });
            document.getElementById('limpiarFiltrosLotes').addEventListener('click', clearLotesFilters);
            ['detalleVentasSearch', 'detalleVentasDesde', 'detalleVentasHasta', 'detalleVentasGanancia'].forEach(id => {
                document.getElementById(id).addEventListener('input', applyDetalleVentasFilters);
                document.getElementById(id).addEventListener('change', applyDetalleVentasFilters);
            });
            document.getElementById('limpiarFiltrosDetalleVentas').addEventListener('click', clearDetalleVentasFilters);
            setupColumnSelector('inventarioTable', 'inventarioColumnSelector', ['ID', 'Nombre', 'Código', 'Categoría', 'Stock', 'Precio venta', 'Lotes activos']);
            setupColumnSelector('movimientosTable', 'movimientosColumnSelector', ['ID', 'Fecha', 'Producto', 'Tipo', 'Cantidad', 'Precio unitario', 'Stock anterior', 'Stock nuevo']);
            setupColumnSelector('lotesTable', 'lotesColumnSelector', ['Lote', 'Producto', 'Compra', 'Fecha', 'Cantidad inicial', 'Restante', 'Costo unitario', 'Estado']);
            setupColumnSelector('detalleVentasTable', 'detalleVentasColumnSelector', ['Venta', 'Producto', 'Lote', 'Cantidad', 'Costo FIFO', 'Precio venta', 'Costo total', 'Venta total', 'Ganancia']);
            document.getElementById('cargarDatosGraficosBtn').addEventListener('click', handleLoadDashboard);
            document.getElementById('calcularResumenBtn').addEventListener('click', calcularResumenFinanciero);
        }

        function updateProductReference() {
            const purchaseType = document.getElementById('p_forma_compra').value;
            const quantityUnits = parseInt(document.getElementById('p_cantidad_unidades').value, 10) || 0;
            const unitCostInput = parseFloat(document.getElementById('p_costo_unitario').value) || 0;
            const packageQuantity = parseInt(document.getElementById('p_cantidad_empaque').value, 10) || 0;
            let unitsPerPackage = parseInt(document.getElementById('p_unidades_empaque').value, 10) || 0;
            const packagePrice = parseFloat(document.getElementById('p_precio_empaque').value) || 0;
            const margin = parseFloat(document.getElementById('p_margen').value) || 0;

            if (purchaseType === 'docena') {
                unitsPerPackage = 12;
                document.getElementById('p_unidades_empaque').value = '12';
            }

            const totalUnits = purchaseType === 'unidad'
                ? quantityUnits
                : packageQuantity * unitsPerPackage;
            const totalCost = purchaseType === 'unidad'
                ? quantityUnits * unitCostInput
                : packageQuantity * packagePrice;
            const unitCost = purchaseType === 'unidad'
                ? unitCostInput
                : totalUnits > 0 ? totalCost / totalUnits : 0;

            const suggestedPrice = unitCost * (1 + margin / 100);
            document.getElementById('p_stock').value = totalUnits;
            document.getElementById('p_costo_unitario_calculado').value = unitCost > 0 ? unitCost.toFixed(2) : '';
            document.getElementById('p_costo_total_calculado').value = totalCost > 0 ? totalCost.toFixed(2) : '';
            document.getElementById('p_precio_sugerido').value = suggestedPrice > 0 ? suggestedPrice.toFixed(2) : '';

            document.querySelectorAll('.packaging-field, .unit-field').forEach(field => {
                field.closest('.form-group').classList.toggle('hidden',
                    purchaseType === 'unidad' ? field.classList.contains('packaging-field') : field.classList.contains('unit-field'));
            });
        }

        /* Lectura QR y codigo de barras desactivada temporalmente.
        const activeQrScanners = {};

        function setupQrScanner(prefix) {
            document.getElementById(`${prefix}_scan_btn`).addEventListener('click', () => startQrScanner(prefix));
            document.getElementById(`${prefix}_scan_close`).addEventListener('click', () => stopQrScanner(prefix));
        }

        async function startQrScanner(prefix) {
            const wrapper = document.getElementById(`${prefix}_scanner_wrapper`);
            const scannerElementId = `${prefix}_scanner`;

            if (typeof Html5Qrcode === 'undefined') {
                displayStatus(prefix === 'co' ? 'statusCompra' : 'statusVenta', 'error', 'No se pudo cargar el lector QR o de barras. Verifique su conexión a internet.');
                return;
            }

            await stopQrScanner(prefix);
            wrapper.classList.remove('hidden');

            const scanner = new Html5Qrcode(scannerElementId);
            activeQrScanners[prefix] = scanner;
            const scannerConfig = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                formatsToSupport: [
                    Html5QrcodeSupportedFormats.QR_CODE,
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.EAN_8,
                    Html5QrcodeSupportedFormats.CODE_128,
                    Html5QrcodeSupportedFormats.CODE_39,
                    Html5QrcodeSupportedFormats.UPC_A,
                    Html5QrcodeSupportedFormats.UPC_E
                ]
            };

            try {
                await scanner.start(
                    { facingMode: 'environment' },
                    scannerConfig,
                    async decodedText => {
                        document.getElementById(`${prefix}_query`).value = decodedText.trim();
                        await stopQrScanner(prefix);
                        await handleQueryFilter(decodedText.trim(), prefix);
                    },
                    () => {}
                );
            } catch (error) {
                await stopQrScanner(prefix);
                displayStatus(prefix === 'co' ? 'statusCompra' : 'statusVenta', 'error', `No se pudo abrir la cámara: ${error.message}`);
            }
        }

        async function stopQrScanner(prefix) {
            const scanner = activeQrScanners[prefix];
            const wrapper = document.getElementById(`${prefix}_scanner_wrapper`);

            if (scanner) {
                try {
                    await scanner.stop();
                    await scanner.clear();
                } catch (error) {
                    console.warn('No se pudo cerrar el lector QR:', error);
                }
                delete activeQrScanners[prefix];
            }

            wrapper.classList.add('hidden');
        }
        */

        // ================= DASHBOARD FUNCTIONS =================
        
        async function handleLoadDashboard() {
            await calcularResumenFinanciero();
            await cargarDatosGraficos();
        }

        async function calcularResumenFinanciero() {
            displayStatus('statusDashboard', 'info', 'Calculando resumen financiero...');
            
            try {
                // Obtener datos de ventas y compras
                const [ventasResponse, comprasResponse] = await Promise.all([
                    fetch(`${SCRIPT_URL}?action=getData&sheetName=VENTAS`),
                    fetch(`${SCRIPT_URL}?action=getData&sheetName=COMPRAS`)
                ]);

                const ventasData = await ventasResponse.json();
                const comprasData = await comprasResponse.json();

                let totalVentas = 0;
                let totalCompras = 0;

                // Calcular total de ventas
                if (ventasData.status === 'success' && ventasData.data) {
                    totalVentas = ventasData.data.reduce((sum, venta) => {
                        return sum + (parseFloat(venta.cantidad) * parseFloat(venta.precio_venta));
                    }, 0);
                }

                // Calcular total de compras
                if (comprasData.status === 'success' && comprasData.data) {
                    totalCompras = comprasData.data.reduce((sum, compra) => {
                        return sum + (parseFloat(compra.cantidad) * parseFloat(compra.precio_compra));
                    }, 0);
                }

                const ganancias = totalVentas - totalCompras;

                // Actualizar estadísticas
                document.getElementById('totalVentas').textContent = `S/${totalVentas.toFixed(2)}`;
                document.getElementById('totalCompras').textContent = `S/${totalCompras.toFixed(2)}`;
                document.getElementById('totalGanancias').textContent = `S/${ganancias.toFixed(2)}`;
                document.getElementById('totalGastos').textContent = `S/${totalCompras.toFixed(2)}`;

                // Colores según ganancias
                const gananciasElement = document.getElementById('totalGanancias');
                if (ganancias > 0) {
                    gananciasElement.style.color = 'var(--secondary-color)';
                } else if (ganancias < 0) {
                    gananciasElement.style.color = 'var(--danger-color)';
                } else {
                    gananciasElement.style.color = '#666';
                }

                displayStatus('statusDashboard', 'success', `Resumen calculado: Ventas: S/${totalVentas.toFixed(2)} | Compras: S/${totalCompras.toFixed(2)} | Ganancia: S/${ganancias.toFixed(2)}`);

                return { totalVentas, totalCompras, ganancias };

            } catch (error) {
                displayStatus('statusDashboard', 'error', `Error al calcular resumen: ${error.message}`);
                return { totalVentas: 0, totalCompras: 0, ganancias: 0 };
            }
        }

        async function cargarDatosGraficos() {
            try {
                // Obtener datos para gráficos
                const resumenResponse = await fetch(`${SCRIPT_URL}?action=getResumenDiario`);
                const resumenData = await resumenResponse.json();

                if (resumenData.status === 'success' && resumenData.data && resumenData.data.length > 0) {
                    renderCharts(resumenData.data);
                } else {
                    // Si no hay datos en resumen_diario, usar datos de ventas/compras
                    await renderChartsFromRawData();
                }

            } catch (error) {
                displayStatus('statusDashboard', 'error', `Error al cargar gráficos: ${error.message}`);
            }
        }

        async function renderChartsFromRawData() {
            try {
                const [ventasResponse, comprasResponse] = await Promise.all([
                    fetch(`${SCRIPT_URL}?action=getData&sheetName=VENTAS`),
                    fetch(`${SCRIPT_URL}?action=getData&sheetName=COMPRAS`)
                ]);

                const ventasData = await ventasResponse.json();
                const comprasData = await comprasResponse.json();

                // Agrupar por fecha
                const ventasPorFecha = {};
                const comprasPorFecha = {};

                if (ventasData.status === 'success' && ventasData.data) {
                    ventasData.data.forEach(venta => {
                        //const fecha = new Date(venta.fecha).toLocaleDateString();
                        const fecha = new Date(venta.fecha).toISOString().split('T')[0]; // Formato YYYY-MM-DD
                        const monto = parseFloat(venta.cantidad) * parseFloat(venta.precio_venta);
                        ventasPorFecha[fecha] = (ventasPorFecha[fecha] || 0) + monto;
                    });
                }

                if (comprasData.status === 'success' && comprasData.data) {
                    comprasData.data.forEach(compra => {
                        //const fecha = new Date(compra.fecha).toLocaleDateString();
                        const fecha = new Date(compra.fecha).toISOString().split('T')[0]; // Formato YYYY-MM-DD
                        const monto = parseFloat(compra.cantidad) * parseFloat(compra.precio_compra);
                        comprasPorFecha[fecha] = (comprasPorFecha[fecha] || 0) + monto;
                    });
                }

                // Combinar fechas
                const todasFechas = [...new Set([...Object.keys(ventasPorFecha), ...Object.keys(comprasPorFecha)])];
                todasFechas.sort((a, b) => new Date(a) - new Date(b));

                const datosResumen = todasFechas.map(fecha => ({
                    fecha: fecha,
                    total_ventas: ventasPorFecha[fecha] || 0,
                    total_compras: comprasPorFecha[fecha] || 0,
                    ganancia: (ventasPorFecha[fecha] || 0) - (comprasPorFecha[fecha] || 0)
                }));

                renderCharts(datosResumen);

            } catch (error) {
                console.error('Error al procesar datos para gráficos:', error);
                displayStatus('statusDashboard', 'warning', 'No hay datos suficientes para generar gráficos.');
            }
        }

        function renderCharts(resumenData) {
            const labels = resumenData.map(row => {
                if (row.fecha instanceof Date) {
                    return row.fecha.toLocaleDateString();
                    
                }
                return row.fecha;
            });

            const ventas = resumenData.map(row => row.total_ventas || 0);
            const compras = resumenData.map(row => row.total_compras || 0);
            const ganancias = resumenData.map(row => row.ganancia || 0);

            // 1. Gráfico de Resumen Financiero
            const ctx1 = document.getElementById('resumenFinancieroChart').getContext('2d');
            if (resumenFinancieroChart) resumenFinancieroChart.destroy();
            resumenFinancieroChart = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Ventas',
                            data: ventas,
                            backgroundColor: 'rgba(0, 123, 255, 0.7)',
                            borderColor: 'rgba(0, 123, 255, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Compras',
                            data: compras,
                            backgroundColor: 'rgba(23, 162, 184, 0.7)',
                            borderColor: 'rgba(23, 162, 184, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Ganancias',
                            data: ganancias,
                            type: 'line',
                            fill: false,
                            backgroundColor: 'rgba(40, 167, 69, 0.7)',
                            borderColor: 'rgba(40, 167, 69, 1)',
                            borderWidth: 2,
                            tension: 0.1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Resumen Financiero - Ventas, Compras y Ganancias'
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Monto (S/)'
                            }
                        }
                    }
                }
            });

            // 2. Gráfico de Tendencias
            const ctx2 = document.getElementById('tendenciasChart').getContext('2d');
            if (tendenciasChart) tendenciasChart.destroy();
            tendenciasChart = new Chart(ctx2, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Ventas Acumuladas',
                            data: ventas.reduce((acc, curr, i) => [...acc, (acc[i-1] || 0) + curr], []),
                            borderColor: 'rgba(0, 123, 255, 1)',
                            backgroundColor: 'rgba(0, 123, 255, 0.1)',
                            tension: 0.1,
                            fill: true
                        },
                        {
                            label: 'Compras Acumuladas',
                            data: compras.reduce((acc, curr, i) => [...acc, (acc[i-1] || 0) + curr], []),
                            borderColor: 'rgba(23, 162, 184, 1)',
                            backgroundColor: 'rgba(23, 162, 184, 0.1)',
                            tension: 0.1,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Tendencias Acumuladas - Ventas vs Compras'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Monto Acumulado (S/)'
                            }
                        }
                    }
                }
            });
        }

        // ================= REST OF THE FUNCTIONS (sin cambios) =================
        
        async function handlePostAction(e, action, statusDivId) {
            e.preventDefault();
            const form = e.target;
            const submitBtn = e.submitter;
            submitBtn.disabled = true;
            displayStatus(statusDivId, 'info', `Procesando...`);

            const data = {};
            Array.from(form.elements).forEach(input => {
                if (input.id && input.id.startsWith('p_') || input.id.startsWith('c_')) {
                    data[input.id.replace(/p_|c_/, '')] = input.value;
                }
            });

            if (action === 'agregarProducto') {
                // El costo unitario calculado se guarda como precio de compra unitario.
                data.precio_compra = data.costo_unitario;
            }
            data.action = action;

            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
                });
                const responseData = await response.json();

                if (responseData.status === 'success') {
                    displayStatus(statusDivId, 'success', responseData.message);
                    form.reset(); 
                    if (action === 'agregarProducto') {
                        updateProductReference();
                    }
                    if (action === 'agregarCategoria') {
                        loadInitialData();
                    }
                } else {
                    if (action === 'agregarProducto' && responseData.status === 'warning') {
                        window.alert(responseData.message);
                    }
                    displayStatus(statusDivId, 'error', responseData.message);
                }
            } catch (error) {
                displayStatus(statusDivId, 'error', `Error de conexión: ${error.message}`);
            } finally {
                submitBtn.disabled = false;
            }
        }
        
        async function handleQueryFilter(query, prefix) {
            const detailDiv = document.getElementById(`${prefix}_product_details`);
            const submitBtn = document.getElementById(`${prefix}_submit_btn`);
            const idInput = document.getElementById(`${prefix}_producto_id`);
            
            detailDiv.classList.add('hidden');
            detailDiv.innerHTML = '';
            idInput.value = '';
            submitBtn.disabled = true;

            if (query.length < 2) return;

            try {
                const [response, lotsResponse] = await Promise.all([
                    fetch(`${SCRIPT_URL}?action=buscarProducto&query=${encodeURIComponent(query)}`),
                    fetch(`${SCRIPT_URL}?action=getLotes`)
                ]);
                const data = await response.json();
                const lotsData = await lotsResponse.json();

                if (data.status === 'success' && data.data && data.data.length > 0) {
                    const product = data.data[0];
                    product.lotes = lotsData.status === 'success' && lotsData.data
                        ? lotsData.data.filter(lot => String(lot.producto_id) === String(product.id) && Number(lot.cantidad_restante) > 0)
                        : [];
                    productDataCache[product.id] = product;
                    updateProductDetails(product, detailDiv, prefix);
                    detailDiv.innerHTML = `<p class="status-message success" style="display:block;"><i class="fas fa-check-circle"></i> Producto encontrado</p>${detailDiv.innerHTML}`;
                    idInput.value = product.id;
                    submitBtn.disabled = false;
                } else {
                    detailDiv.classList.remove('hidden');
                    detailDiv.innerHTML = `<p style="color:var(--danger-color);"><i class="fas fa-exclamation-triangle"></i> ${data.message || 'No se encontraron productos.'}</p>`;
                }

            } catch (error) {
                detailDiv.classList.remove('hidden');
                detailDiv.innerHTML = `<p style="color:var(--danger-color);">Error de búsqueda: ${error.message}</p>`;
            }
        }

        function updateProductDetails(product, detailDiv, prefix) {
            detailDiv.classList.remove('hidden');
            
            const isCompra = prefix === 'co';
            const price = isCompra ? product.precio_compra : product.precio_venta;
            const priceLabel = isCompra ? 'Precio Compra Actual' : 'Precio Venta Actual';

            const stockStyle = product.stock < 5 ? 'style="font-weight:bold; color:var(--danger-color);"' : 'style="font-weight:bold; color:var(--secondary-color);"';
            const lotsHtml = formatProductLots(product.lotes);

            detailDiv.innerHTML = `
                <p><b>ID:</b> ${product.id} | <b>Producto:</b> ${product.nombre} (Cód: ${product.código})</p>
                <p><b>Categoría:</b> ${product.categoría}</p>
                <p><b>Stock Actual:</b> <span ${stockStyle}>${product.stock}</span></p>
                <p><b>${priceLabel}:</b> $${parseFloat(price).toFixed(2)}</p>
                <div class="product-lots"><b>Lotes FIFO:</b>${lotsHtml}</div>
            `;
            
            document.getElementById(`${prefix}_precio_${isCompra ? 'compra' : 'venta'}`).value = parseFloat(price).toFixed(2);
            
            if (!isCompra && product.stock < 5) {
                detailDiv.innerHTML += `<p class="status-message warning" style="display:block; margin-top: 10px;">Stock bajo. Solo quedan ${product.stock} unidades.</p>`;
            }
        }

        async function handleTransactionPost(e, type) {
            e.preventDefault();
            const form = e.target;
            const prefix = type === 'compra' ? 'co' : 'v';
            const statusDivId = type === 'compra' ? 'statusCompra' : 'statusVenta';
            
            const submitBtn = document.getElementById(`${prefix}_submit_btn`);
            submitBtn.disabled = true;
            displayStatus(statusDivId, 'info', `Registrando ${type}...`);

            const productoId = document.getElementById(`${prefix}_producto_id`).value;
            
            if (!productoId) {
                 displayStatus(statusDivId, 'error', `No hay producto seleccionado. Busque y seleccione uno.`);
                 submitBtn.disabled = false;
                 return;
            }

            const transaccionData = {
                action: 'registrarTransaccion',
                producto_id: productoId,
                cantidad: document.getElementById(`${prefix}_cantidad`).value,
                precio: document.getElementById(`${prefix}_precio_${type === 'compra' ? 'compra' : 'venta'}`).value,
                type: type,
                extra_data: document.getElementById(`${prefix}_${type === 'compra' ? 'proveedor' : 'cliente'}`).value,
            };

            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify(transaccionData),
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
                });
                const data = await response.json();

                if (data.status === 'success') {
                    displayStatus(statusDivId, 'success', data.message);
                    form.reset(); 
                    delete productDataCache[productoId]; 
                    document.getElementById(`${prefix}_product_details`).classList.add('hidden');
                } else {
                    displayStatus(statusDivId, 'error', data.message);
                }
            } catch (error) {
                displayStatus(statusDivId, 'error', `Error de conexión: ${error.message}`);
            } finally {
                submitBtn.disabled = false;
            }
        }
        //<!-- ================= CARGAR INVENTARIO ================= -->
        async function loadInventario() {
            displayStatus('statusInventario', 'info', 'Cargando datos de inventario...');
            const tableBody = document.getElementById('inventarioTableBody');
            tableBody.innerHTML = '<tr><td colspan="7">Cargando...</td></tr>';

            try {
                const [response, lotsResponse] = await Promise.all([
                    fetch(`${SCRIPT_URL}?action=getInventario`),
                    fetch(`${SCRIPT_URL}?action=getLotes`)
                ]);
                const data = await response.json();
                const lotsData = await lotsResponse.json();

                if (data.status === 'success' && data.data && data.data.length > 0) {
                    const lots = lotsData.status === 'success' && lotsData.data ? lotsData.data : [];
                    inventarioDataCache = data.data.map(product => ({
                        ...product,
                        lotes: lots.filter(lot => String(lot.producto_id) === String(product.id) && Number(lot.cantidad_restante) > 0)
                    }));
                    displayStatus('statusInventario', 'success', `Inventario cargado: ${data.data.length} productos.`);
                    renderInventoryRows(inventarioDataCache);
                } else {
                    displayStatus('statusInventario', 'warning', data.message);
                    tableBody.innerHTML = '<tr><td colspan="7">No hay productos en inventario.</td></tr>';
                }
            } catch (error) {
                displayStatus('statusInventario', 'error', `Error al cargar inventario: ${error.message}`);
                tableBody.innerHTML = '<tr><td colspan="7">Error al cargar datos.</td></tr>';
            }
        }

        function applyInventoryFilters() {
            const search = normalizeInventoryText(document.getElementById('inventarioSearch').value);
            const from = document.getElementById('inventarioDesde').value;
            const to = document.getElementById('inventarioHasta').value;
            const stockFilter = document.getElementById('inventarioStock').value;

            if (from && to && from > to) {
                displayStatus('statusInventario', 'warning', 'La fecha inicial no puede ser posterior a la fecha final.');
                return;
            }

            const filteredProducts = inventarioDataCache.filter(product => {
                const searchableText = [product.id, product.nombre, product.código, product.codigo, product.categoría, product.categoria]
                    .map(normalizeInventoryText)
                    .join(' ');
                const matchesText = !search || searchableText.includes(search);
                const productDate = getInventoryDate(product.fecha_creado);
                const matchesFrom = !from || (productDate && productDate >= from);
                const matchesTo = !to || (productDate && productDate <= to);
                const stock = Number(product.stock) || 0;
                const matchesStock = stockFilter === 'todos' ||
                    (stockFilter === 'disponible' && stock >= 5) ||
                    (stockFilter === 'bajo' && stock > 0 && stock < 5) ||
                    (stockFilter === 'agotado' && stock <= 0);

                return matchesText && matchesFrom && matchesTo && matchesStock;
            });

            renderInventoryRows(filteredProducts);
            displayStatus('statusInventario', 'info', `${filteredProducts.length} de ${inventarioDataCache.length} productos encontrados.`);
        }

        function normalizeInventoryText(value) {
            return String(value || '')
                .trim()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase();
        }

        function getInventoryDate(value) {
            if (!value) return '';
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return '';
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }

        function renderInventoryRows(products) {
            const tableBody = document.getElementById('inventarioTableBody');
            if (!products.length) {
                tableBody.innerHTML = '<tr><td colspan="7">No se encontraron productos con esos filtros.</td></tr>';
                return;
            }

            tableBody.innerHTML = products.map(product => {
                const stock = Number(product.stock) || 0;
                const price = Number(product.precio_venta) || 0;
                const stockStyle = stock < 5 ? 'style="color: var(--danger-color); font-weight: bold;"' : '';
                const lotsSummary = formatProductLots(product.lotes, true);
                return `
                    <tr>
                        <td>${product.id || ''}</td>
                        <td>${product.nombre || ''}</td>
                        <td>${product.código || product.codigo || ''}</td>
                        <td>${product.categoría || product.categoria || ''}</td>
                        <td ${stockStyle}>${stock}</td>
                        <td>S/ ${price.toFixed(2)}</td>
                        <td>${lotsSummary}</td>
                    </tr>
                `;
            }).join('');
        }

        function formatProductLots(lots, compact = false) {
            if (!lots || !lots.length) return '<span class="no-lots">Sin lotes activos</span>';
            return `<div class="lots-summary">${lots.map(lot => {
                const label = `${lot.id}: ${lot.cantidad_restante} u. a S/${(Number(lot.costo_unitario) || 0).toFixed(2)}`;
                return compact ? `<span class="lot-chip">${label}</span>` : `<div>${label}</div>`;
            }).join('')}</div>`;
        }

        function clearInventoryFilters() {
            document.getElementById('inventarioSearch').value = '';
            document.getElementById('inventarioDesde').value = '';
            document.getElementById('inventarioHasta').value = '';
            document.getElementById('inventarioStock').value = 'todos';
            renderInventoryRows(inventarioDataCache);
            displayStatus('statusInventario', 'success', `${inventarioDataCache.length} productos mostrados.`);
        }

        async function loadMovimientos() {
            const tableBody = document.getElementById('movimientosTableBody');
            displayStatus('statusMovimientos', 'info', 'Cargando movimientos...');
            tableBody.innerHTML = '<tr><td colspan="9">Cargando...</td></tr>';

            try {
                const [movementsResponse, inventoryResponse] = await Promise.all([
                    fetch(`${SCRIPT_URL}?action=getMovimientos`),
                    fetch(`${SCRIPT_URL}?action=getInventario`)
                ]);
                const data = await movementsResponse.json();
                const inventoryData = await inventoryResponse.json();

                if (data.status !== 'success' || !data.data || !data.data.length) {
                    displayStatus('statusMovimientos', 'warning', data.message || 'No hay movimientos registrados.');
                    tableBody.innerHTML = '<tr><td colspan="9">No hay movimientos registrados.</td></tr>';
                    return;
                }

                const productNames = {};
                if (inventoryData.status === 'success' && inventoryData.data) {
                    inventoryData.data.forEach(product => {
                        productNames[String(product.id)] = product.nombre || product.id;
                    });
                }

                tableBody.innerHTML = data.data.slice().reverse().map(movement => {
                    const movementType = String(movement.tipo || '').toUpperCase();
                    const movementClass = movementType === 'VENTA' ? 'movement-sale' : movementType === 'COMPRA' ? 'movement-purchase' : '';
                    const unitPrice = Number(movement.costo_unitario) || 0;
                    const productId = String(movement.producto_id || '');
                    const productName = productNames[productId] || productId;
                    return `
                    <tr class="${movementClass}">
                        <td>${movement.id || ''}</td>
                        <td>${formatMovementDate(movement.fecha)}</td>
                        <td>${productName}</td>
                        <td><strong>${movement.tipo || ''}</strong></td>
                        <td>${movement.cantidad || 0}</td>
                        <td>S/ ${unitPrice.toFixed(2)}</td>
                        <td>${movement.stock_anterior || 0}</td>
                        <td>${movement.stock_nuevo || 0}</td>
                        <!-- <td>${movement.motivo || ''}</td> -->
                    </tr>
                `;
                }).join('');
                displayStatus('statusMovimientos', 'success', `${data.data.length} movimientos cargados.`);
            } catch (error) {
                displayStatus('statusMovimientos', 'error', `Error al cargar movimientos: ${error.message}`);
                tableBody.innerHTML = '<tr><td colspan="9">Error al cargar el historial.</td></tr>';
            }
        }

        function formatMovementDate(value) {
            const date = new Date(value);
            return Number.isNaN(date.getTime()) ? value || '' : date.toLocaleString();
        }

        async function loadLotes() {
            const tableBody = document.getElementById('lotesTableBody');
            displayStatus('statusLotes', 'info', 'Cargando lotes FIFO...');
            tableBody.innerHTML = '<tr><td colspan="8">Cargando...</td></tr>';

            try {
                const [lotsResponse, inventoryResponse] = await Promise.all([
                    fetch(`${SCRIPT_URL}?action=getLotes`),
                    fetch(`${SCRIPT_URL}?action=getInventario`)
                ]);
                const lotsData = await lotsResponse.json();
                const inventoryData = await inventoryResponse.json();
                if (lotsData.status !== 'success' || !lotsData.data || !lotsData.data.length) {
                    displayStatus('statusLotes', 'warning', lotsData.message || 'No hay lotes registrados.');
                    tableBody.innerHTML = '<tr><td colspan="8">No hay lotes registrados.</td></tr>';
                    return;
                }

                const productNames = createProductNameMap(inventoryData);
                lotesDataCache = lotsData.data.map(lot => ({ ...lot, productName: productNames[String(lot.producto_id)] || lot.producto_id || '' }));
                renderLotesRows(lotesDataCache);
                displayStatus('statusLotes', 'success', `${lotsData.data.length} lotes cargados.`);
            } catch (error) {
                displayStatus('statusLotes', 'error', `Error al cargar lotes: ${error.message}`);
                tableBody.innerHTML = '<tr><td colspan="8">Error al cargar lotes.</td></tr>';
            }
        }

        function renderLotesRows(lots) {
            const tableBody = document.getElementById('lotesTableBody');
            tableBody.innerHTML = lots.slice().reverse().map(lot => {
                    const remaining = Number(lot.cantidad_restante) || 0;
                    const statusClass = remaining > 0 ? 'lot-active' : 'lot-empty';
                    return `<tr class="${statusClass}">
                        <td>${lot.id || ''}</td>
                        <td>${lot.productName || lot.producto_id || ''}</td>
                        <td>${lot.compra_id || ''}</td>
                        <td>${formatMovementDate(lot.fecha)}</td>
                        <td>${lot.cantidad_inicial || 0}</td>
                        <td>${remaining}</td>
                        <td>S/ ${(Number(lot.costo_unitario) || 0).toFixed(2)}</td>
                        <td>${lot.estado || ''}</td>
                    </tr>`;
                }).join('');
        }

        function applyLotesFilters() {
            const search = normalizeInventoryText(document.getElementById('lotesSearch').value);
            const from = document.getElementById('lotesDesde').value;
            const to = document.getElementById('lotesHasta').value;
            const status = document.getElementById('lotesEstado').value;
            const filtered = lotesDataCache.filter(lot => {
                const text = normalizeInventoryText(`${lot.id} ${lot.productName} ${lot.compra_id}`);
                const date = getInventoryDate(lot.fecha);
                const state = String(lot.estado || (Number(lot.cantidad_restante) > 0 ? 'ACTIVO' : 'AGOTADO')).toUpperCase();
                return (!search || text.includes(search)) && (!from || date >= from) && (!to || date <= to) && (status === 'todos' || state === status);
            });
            renderLotesRows(filtered);
            displayStatus('statusLotes', 'info', `${filtered.length} de ${lotesDataCache.length} lotes encontrados.`);
        }

        function clearLotesFilters() {
            ['lotesSearch', 'lotesDesde', 'lotesHasta'].forEach(id => document.getElementById(id).value = '');
            document.getElementById('lotesEstado').value = 'todos';
            renderLotesRows(lotesDataCache);
            displayStatus('statusLotes', 'success', `${lotesDataCache.length} lotes mostrados.`);
        }

        async function loadDetalleVentas() {
            const tableBody = document.getElementById('detalleVentasTableBody');
            displayStatus('statusDetalleVentas', 'info', 'Cargando detalle FIFO...');
            tableBody.innerHTML = '<tr><td colspan="9">Cargando...</td></tr>';

            try {
                const [detailsResponse, inventoryResponse, salesResponse] = await Promise.all([
                    fetch(`${SCRIPT_URL}?action=getDetalleVentas`),
                    fetch(`${SCRIPT_URL}?action=getInventario`),
                    fetch(`${SCRIPT_URL}?action=getData&sheetName=VENTAS`)
                ]);
                const detailsData = await detailsResponse.json();
                const inventoryData = await inventoryResponse.json();
                const salesData = await salesResponse.json();
                if (detailsData.status !== 'success' || !detailsData.data || !detailsData.data.length) {
                    displayStatus('statusDetalleVentas', 'warning', detailsData.message || 'No hay detalles FIFO registrados.');
                    tableBody.innerHTML = '<tr><td colspan="9">No hay detalles FIFO registrados.</td></tr>';
                    return;
                }

                const productNames = createProductNameMap(inventoryData);
                const saleDates = {};
                if (salesData.status === 'success' && salesData.data) {
                    salesData.data.forEach(sale => {
                        saleDates[String(sale.id)] = sale.fecha;
                    });
                }
                detalleVentasDataCache = detailsData.data.map(detail => ({
                    ...detail,
                    productName: productNames[String(detail.producto_id)] || detail.producto_id || '',
                    fecha: saleDates[String(detail.venta_id)] || ''
                }));
                renderDetalleVentasRows(detalleVentasDataCache);
                displayStatus('statusDetalleVentas', 'success', `${detailsData.data.length} detalles FIFO cargados.`);
            } catch (error) {
                displayStatus('statusDetalleVentas', 'error', `Error al cargar detalle FIFO: ${error.message}`);
                tableBody.innerHTML = '<tr><td colspan="9">Error al cargar el detalle.</td></tr>';
            }
        }

        function renderDetalleVentasRows(details) {
            const tableBody = document.getElementById('detalleVentasTableBody');
            tableBody.innerHTML = details.slice().reverse().map(detail => {
                    const gain = Number(detail.ganancia) || 0;
                    const gainClass = gain >= 0 ? 'gain-positive' : 'gain-negative';
                    return `<tr>
                        <td>${detail.venta_id || ''}</td>
                        <td>${detail.productName || detail.producto_id || ''}</td>
                        <td>${detail.lote_id || ''}</td>
                        <td>${detail.cantidad || 0}</td>
                        <td>S/ ${(Number(detail.costo_unitario) || 0).toFixed(2)}</td>
                        <td>S/ ${(Number(detail.precio_venta) || 0).toFixed(2)}</td>
                        <td>S/ ${(Number(detail.subtotal_costo) || 0).toFixed(2)}</td>
                        <td>S/ ${(Number(detail.subtotal_venta) || 0).toFixed(2)}</td>
                        <td class="${gainClass}">S/ ${gain.toFixed(2)}</td>
                    </tr>`;
                }).join('');
        }

        function applyDetalleVentasFilters() {
            const search = normalizeInventoryText(document.getElementById('detalleVentasSearch').value);
            const from = document.getElementById('detalleVentasDesde').value;
            const to = document.getElementById('detalleVentasHasta').value;
            const gainFilter = document.getElementById('detalleVentasGanancia').value;
            const filtered = detalleVentasDataCache.filter(detail => {
                const text = normalizeInventoryText(`${detail.venta_id} ${detail.productName} ${detail.lote_id}`);
                const date = getInventoryDate(detail.fecha || detail.fecha_venta || detail.created_at);
                const gain = Number(detail.ganancia) || 0;
                return (!search || text.includes(search)) && (!from || date >= from) && (!to || date <= to) &&
                    (gainFilter === 'todas' || (gainFilter === 'positiva' && gain >= 0) || (gainFilter === 'negativa' && gain < 0));
            });
            renderDetalleVentasRows(filtered);
            displayStatus('statusDetalleVentas', 'info', `${filtered.length} de ${detalleVentasDataCache.length} detalles encontrados.`);
        }

        function clearDetalleVentasFilters() {
            ['detalleVentasSearch', 'detalleVentasDesde', 'detalleVentasHasta'].forEach(id => document.getElementById(id).value = '');
            document.getElementById('detalleVentasGanancia').value = 'todas';
            renderDetalleVentasRows(detalleVentasDataCache);
            displayStatus('statusDetalleVentas', 'success', `${detalleVentasDataCache.length} detalles mostrados.`);
        }

        function createProductNameMap(inventoryData) {
            const productNames = {};
            if (inventoryData.status === 'success' && inventoryData.data) {
                inventoryData.data.forEach(product => {
                    productNames[String(product.id)] = product.nombre || product.id;
                });
            }
            return productNames;
        }

        function setupColumnSelector(tableId, selectorId, labels) {
            const selector = document.getElementById(selectorId);
            if (!selector) return;
            selector.innerHTML = '<span class="column-selector-title">Mostrar:</span>';
            labels.forEach((label, index) => {
                const wrapper = document.createElement('label');
                wrapper.className = 'column-option';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = true;
                checkbox.addEventListener('change', () => toggleTableColumn(tableId, index, checkbox.checked));
                wrapper.append(checkbox, document.createTextNode(label));
                selector.appendChild(wrapper);
            });
        }

        function toggleTableColumn(tableId, columnIndex, visible) {
            const table = document.getElementById(tableId);
            if (!table) return;
            table.querySelectorAll('tr').forEach(row => {
                const cell = row.children[columnIndex];
                if (cell) cell.classList.toggle('column-hidden', !visible);
            });
        }
        
        async function loadSummary(type) {
            const sheetName = type === 'Ventas' ? 'VENTAS' : 'COMPRAS';
            displayStatus('statusResumen', 'info', `Cargando resumens de ${sheetName}...`);
            const table = document.getElementById('resumenTable');
            const tableHead = table.querySelector('thead');
            const tableBody = document.getElementById('resumenTableBody');
            table.classList.add('hidden');
            tableBody.innerHTML = '';

            try {
                const [response, inventoryResponse] = await Promise.all([
                    fetch(`${SCRIPT_URL}?action=getData&sheetName=${sheetName}`),
                    fetch(`${SCRIPT_URL}?action=getInventario`)
                ]);
                const data = await response.json();
                const inventoryData = await inventoryResponse.json();

                if (data.status === 'success' && data.data.length > 0) {
                    // Mostrar primero la compra o venta más reciente.
                    data.data.sort((firstRow, secondRow) => {
                        return getSummaryDate(secondRow.fecha) - getSummaryDate(firstRow.fecha);
                    });
                    displayStatus('statusResumen', 'success', `${data.data.length} ${sheetName} registradas.`);
                    table.classList.remove('hidden');
                    
                    const productNames = {};
                    if (inventoryData.status === 'success' && inventoryData.data) {
                        inventoryData.data.forEach(product => {
                            productNames[String(product.id)] = product.nombre || product.id;
                        });
                    }

                    const rowKeys = Object.keys(data.data[0]);
                    const headers = rowKeys.map(h => `<th>${h === 'producto_id' ? 'PRODUCTO' : h.toUpperCase().replace('_', ' ')}</th>`).join('');
                    tableHead.innerHTML = `<tr>${headers}<th>TOTAL</th></tr>`;
                    setupColumnSelector('resumenTable', 'resumenColumnSelector', rowKeys.map(key => key === 'producto_id' ? 'Producto' : key.toUpperCase().replace('_', ' ')).concat('Total'));

                    let totalGeneral = 0;
                    const priceField = type === 'Ventas' ? 'precio_venta' : 'precio_compra';

                    tableBody.innerHTML = data.data.map(row => {
                        const cantidad = parseFloat(row.cantidad) || 0;
                        const precio = parseFloat(row[priceField]) || 0;
                        const subtotal = cantidad * precio;
                        totalGeneral += subtotal;

                        const cells = rowKeys.map(key => {
                            let value = key === 'producto_id'
                                ? (productNames[String(row[key])] || row[key])
                                : row[key];
                            if (value instanceof Date) {
                                value = value.toLocaleDateString();
                            } else if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
                                // Convertir fecha ISO a hora peruana (UTC-5)
                                const fecha = new Date(value);
                                const fechaPeruana = new Date(fecha.getTime() - (5 * 60 * 60 * 1000));
                                const año = fechaPeruana.getUTCFullYear();
                                const mes = String(fechaPeruana.getUTCMonth() + 1).padStart(2, '0');
                                const día = String(fechaPeruana.getUTCDate()).padStart(2, '0');
                                let hora = fechaPeruana.getUTCHours();
                                const minuto = String(fechaPeruana.getUTCMinutes()).padStart(2, '0');
                                const ampm = hora >= 12 ? 'PM' : 'AM';
                                hora = hora % 12 || 12;
                                value = `${año}-${mes}-${día} ${String(hora).padStart(2, '0')}:${minuto} ${ampm}`;
                            } else if (typeof value === 'number') {
                                value = value.toFixed(2);
                            }
                            return `<td>${value}</td>`;
                        }).join('');
                        return `<tr>${cells}<td style="font-weight: bold; color: #007bff;">$${subtotal.toFixed(2)}</td></tr>`;
                    }).join('');

                    // Agregar fila de totales
                    const numColumns = Object.keys(data.data[0]).length + 1;
                    const totalRow = `<tr style="font-weight: bold; background-color: rgba(0, 123, 255, 0.1); border-top: 2px solid #007bff;">
                        <td colspan="${numColumns - 1}">TOTAL GENERAL</td>
                        <td>$${totalGeneral.toFixed(2)}</td>
                    </tr>`;
                    tableBody.innerHTML += totalRow;

                } else {
                    displayStatus('statusResumen', 'warning', `No hay datos en la pestaña ${sheetName}.`);
                }
            } catch (error) {
                displayStatus('statusResumen', 'error', `Error al cargar resumen: ${error.message}`);
            }
        }

        function getSummaryDate(value) {
            const date = value instanceof Date ? value : new Date(value);
            const timestamp = date.getTime();
            return Number.isNaN(timestamp) ? 0 : timestamp;
        }
        
        async function handleConfigAction(action) {
            const statusConfig = document.getElementById('statusConfig');
            setButtonState(true);
            displayStatus('statusConfig', 'info', `Procesando la acción de ${action}...`);

            try {
                const response = await fetch(`${SCRIPT_URL}?action=${action}`);
                const data = await response.json();

                if (data.status === 'success') {
                    displayStatus('statusConfig', 'success', data.message);
                    loadInitialData();
                } else {
                    displayStatus('statusConfig', 'error', data.message);
                }
            } catch (error) {
                displayStatus('statusConfig', 'error', `Error de conexión: ${error.message}.`);
            } finally {
                setButtonState(false);
            }
        }

        function setButtonState(disabled) {
            document.getElementById('iniciarDBBtn').disabled = disabled;
            document.getElementById('resetDBBtn').disabled = disabled;
        }
        
        function displayStatus(elementId, type, message) {
            const el = document.getElementById(elementId);
            if (!el) return;
            el.style.display = 'block';
            el.className = `status-message ${type}`;
            el.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : type === 'warning' ? 'exclamation-triangle' : 'info'}-circle"></i> ${message}`;
        }

        
