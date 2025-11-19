// src/hooks/useFetchInventory.js

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const useFetchInventory = () => {
    const [inventoryData, setInventoryData] = useState(null);
    const [appSettings, setAppSettings] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                await Swal.fire({
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading(),
                    position: 'bottom-end',
                    showConfirmButton: false,
                    text: 'Please wait',
                    title: 'Fetching Inventory...',
                    width: '25%',
                });

                const inventoryResponse = await fetch(
                    'http://localhost:5000/inventoryData'
                );
                const inventory = await inventoryResponse.json();

                setInventoryData(inventory);

                const settingsResponse = await fetch(
                    'http://localhost:5000/settings'
                );
                const settings = await settingsResponse.json();

                setAppSettings(settings);

                Swal.close();
                await Swal.fire({
                    icon: 'success',
                    position: 'bottom-end',
                    showConfirmButton: false,
                    text: 'Inventory Loaded',
                    timer: 1500,
                    width: '15%',
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                Swal.fire({
                    icon: 'error',
                    position: 'bottom-end',
                    text: 'An error occurred while fetching inventory',
                    title: 'Error!',
                    width: '15%',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { appSettings, inventoryData, loading, };
};

export default useFetchInventory;
