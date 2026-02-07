"use strict";

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const port = process.env.PORT || 3000;

const db = {};
let next_id = 0;

app.get('/', (req, res) => {
    try {
        return res.json({
            success: true, 
            data : {}, 
            message: 'Server is up and running'
        });
    } catch (error) {
        console.error('Error in root route:', error);
        return res.status(500).json({
            success: false,
            data: {},
            message: 'Internal server error'
        });
    }
})

app.post('/items', async (req, res) => {
    try {
        const wait = Math.floor(Math.random() * 100);
        console.log(`Waiting time ${wait} sec`);
        const id = next_id;
        next_id++;
        db[id] = {
            id,
            status: 'creating',
            updatedAt : Date.now()
        };

        setTimeout(() => {
            try {
                db[id].status = 'Success';
                db[id].updatedAt = Date.now();
                console.log(`Item created with id: ${id}`)
            } catch (error) {
                console.error(`Error updating item ${id}:`, error);
            }
        }, wait * 1000);

        return res.json({
            success: true, 
            data: db[id],
            message: 'Being created'
        });
    } catch (error) {
        console.error('Error creating item:', error);
        return res.status(500).json({
            success: false,
            data: {},
            message: 'Failed to create item'
        });
    }
});

app.get('/items', (req, res) => {
    try {
        return res.status(200).json({
            success: true, 
            data: {
                items: db,
                total: Object.keys(db).length
            },
            message: 'Items fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching items:', error);
        return res.status(500).json({
            success: false,
            data: {},
            message: 'Failed to fetch items'
        });
    }
})

app.get('/items/:id/status', (req, res) => {
    try {
        const id = Number(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({
                success: false, 
                data: {},
                message: 'Invalid item ID'
            });
        }
        
        console.log('id is', id);
        const item = db[id];
        
        if (item) {
            let timepassed = Math.floor((Date.now() - item.updatedAt)/1000);
            return res.status(200).json({
                success: true, 
                data: {
                    status: item.status,
                    timepassed
                },
                message: 'Status fetched'
            });
        } else {
            return res.status(404).json({
                success: false, 
                data: {},
                message: 'Item not found'
            });
        }
    } catch (error) {
        console.error('Error fetching item status:', error);
        return res.status(500).json({
            success: false,
            data: {},
            message: 'Failed to fetch item status'
        });
    }
})

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        data: {},
        message: 'Internal server error'
    });
})

app.listen(port, (err) => {
    if (err) {
        console.error(`Error while starting the server:`, err);
        process.exit(1);
    }
    console.log(`App listening on port ${port}`);
})

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});