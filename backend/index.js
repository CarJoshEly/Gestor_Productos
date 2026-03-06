const express = require("express");
const cors = require("cors");
const {PrismaClient} = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

//list
app.get("/api/products", async (req, res) => {
    const items = await prisma.Product.findMany({
        orderBy: {id: "desc"},
        include: { category: true }
    });
    res.json(items);
});

//Get one
app.get("/api/products/:id", async (req, res) => {
    const id = Number(req.params.id);
    const item = await prisma.Product.findUnique({
        where: {id},
        include: { category: true }
    });
    if(!item) return res.status(400).json({message: "Not Found"});
    res.json(item);
});

//Create
app.post("/api/products", async (req, res) => {
    const {name, description, price, categoryId} = req.body;
    if(!name || price === undefined){
        return res.status(400).json({message:"Name and price are required"})
    }

    const created = await prisma.Product.create({
        data: {
            name: String(name).trim(),
            description: description ?  String(description).trim(): null,
            price: Number(price),
            categoryId: categoryId ? Number(categoryId) : null,
        },
        include: { category: true }
    });
    res.status(201).json(created);
});

//Update
app.put("/api/products/:id", async (req, res) => {
    const id = Number(req.params.id)
    const {name, description, price, categoryId} = req.body;

    const updated = await prisma.Product.update({
        where:{id},
        data: {
            name: name === undefined ? undefined: String(name).trim(),
            description: description === undefined ? undefined: (description ? String(description).trim(): null),
            price: price === undefined ? undefined: Number(price),
            categoryId: categoryId === undefined ? undefined : (categoryId ? Number(categoryId) : null),
        },
        include: { category: true }
    });
    res.status(201).json(updated);
});

//Delete
app.delete("/api/products/:id", async (req, res) => {
    const id = Number(req.params.id)
    try{
        await prisma.Product.delete({where: {id}});
        res.status(204).send();
    }catch(error){
        res.status(404).json({message: "Not Found"});
    }
});

// Categories CRUD
// List categories
app.get("/api/categories", async (req, res) => {
    const categories = await prisma.Category.findMany({
        orderBy: {name: "asc"},
        include: { _count: { select: { products: true } } }
    });
    res.json(categories);
});

// Get one category
app.get("/api/categories/:id", async (req, res) => {
    const id = Number(req.params.id);
    const category = await prisma.Category.findUnique({
        where: {id},
        include: { products: true }
    });
    if(!category) return res.status(404).json({message: "Category not found"});
    res.json(category);
});

// Create category
app.post("/api/categories", async (req, res) => {
    const {name, description} = req.body;
    if(!name){
        return res.status(400).json({message:"Category name is required"})
    }

    try {
        const created = await prisma.Category.create({
            data: {
                name: String(name).trim(),
                description: description ? String(description).trim() : null,
            },
        });
        res.status(201).json(created);
    } catch (error) {
        if (error.code === 'P2002') {
            res.status(400).json({message: "Category name already exists"});
        } else {
            res.status(500).json({message: "Error creating category"});
        }
    }
});

// Update category
app.put("/api/categories/:id", async (req, res) => {
    const id = Number(req.params.id)
    const {name, description} = req.body;

    try {
        const updated = await prisma.Category.update({
            where:{id},
            data: {
                name: name === undefined ? undefined: String(name).trim(),
                description: description === undefined ? undefined: (description ? String(description).trim(): null),
            },
        });
        res.status(200).json(updated);
    } catch (error) {
        if (error.code === 'P2002') {
            res.status(400).json({message: "Category name already exists"});
        } else if (error.code === 'P2025') {
            res.status(404).json({message: "Category not found"});
        } else {
            res.status(500).json({message: "Error updating category"});
        }
    }
});

// Delete category
app.delete("/api/categories/:id", async (req, res) => {
    const id = Number(req.params.id)
    try{
        await prisma.Category.delete({where: {id}});
        res.status(204).send();
    }catch(error){
        if (error.code === 'P2025') {
            res.status(404).json({message: "Category not found"});
        } else {
            res.status(400).json({message: "Cannot delete category with products"});
        }
    }
});

app.listen(4000, () => console.log("API on http://localhost:4000"));