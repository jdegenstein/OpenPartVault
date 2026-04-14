# 📦 OpenPartVault

A collaborative, git-backed library for storing and version-controlling CAD models, STEP files, and associated source scripts.

🌐 **[Explore the Vault](https://jdegenstein.github.io/OpenPartVault)**

## 📂 How It Works

All models are stored in the `/parts` directory. The website is automatically generated from this directory using GitHub Actions and Astro. 

## 🛠️ How to Contribute a Part

1. **Branch or Fork** the repository.
2. **Copy the `_template` folder** inside `/parts` and rename it to your part's name (e.g., `parts/m4_socket_head_screw`).
3. **Add your files:** Replace the placeholder CAD files with your `.step` and `.stl` files. Include any source files (Python, FreeCAD, etc.).
4. **Update `metadata.yaml`:** Fill in the tags, author, and license information.
5. **Update `description.md`:** Write a clear description of the part.
6. **Provide a `thumbnail.png`:** This is required for the website gallery grid.
7. **Submit a Pull Request.**

Once merged, the site will automatically rebuild and publish.

## 💬 Collaboration

Use **[Issues](../../issues)** for requests and **[Discussions](../../discussions)** for general design reviews.
