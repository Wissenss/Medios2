const homePage = {
  template:
  /*html*/
  `
  <div class="home-page">
    <div id="side-bar">
      <h1>Librería Web</h1>
      <div style="flex:1; height:100%;"></div>
      <button class="icon-button" style="height: 50px; width: 100%;" @click="changeTheme();"><span class="bi-brightness-alt-high-fill" style="font-size: 15px;"></span></button>
    </div>

    <div class="left-container">
      <div class="top-controls">
        <h1 style="width: 200px;">Archivos</h1>
        <div style="flex: 1;"></div>
        <button class="add-file-button" @click="onAddFileButtonClick();"><span class="bi-file-earmark-plus-fill" style="font-size: 15px; vertical-align: center;">  Nuevo</span></button>
      </div>

      <table class="file-list">
        <tr>
          <th>Nombre</th>
          <th>Categoría</th>
          <th>Descripción</th>
        </tr>
        <tr v-for="(file, index) in files" class="file-item">
          <td> {{ file.name }} </td>
          <td> {{ file.category }} </td>
          <td> {{ file.description }} </td>
          <td>
            <button @click="onOpenBookClick(file.key);"><span class="bi-arrow-up-right-square-fill"></span></button>
          </td>
          <td>
            <button @click="onDeleteBookClick(file.key)"><span class="bi-x-square-fill"></span></button>
          </td>
        </tr>
      </table>
    </div>

    <div class="right-container">
      <h1>Filtros</h1>

      <label for="pet-select">Categoría:</label>

      <select name="pets" id="selected-category" style="margin-top: 20px; width: 100%;">
        <option value="">"Todas"</option>
        <option value="Matemáticas">Matemáticas</option>
        <option value="Historia">Historia</option>
        <option value="Biología">Biología</option>
        <option value="Química">Química</option>
        <option value="Física">Física</option>
      </select>

      <button class="icon-button" style="margin-top: 20px; height: 40px;" @click="aplicarFiltros();"><span class="bi-sliders2" style="font-size: 15px; vertical-align: center;">  Aplicar Filtros</span></button>
    </div>

    <!-- add file modal -->
    <dialog id="add-file-modal" autofocus>
      <h1>Añadir Archivo</h1>

      <table style="border-spacing: 20px;">
        <tr>
          <td> <label id="file-name-label" for="file-name-input">Nombre</label> </td>
          <td> <input id="file-name-input" type="text"/> </td>
        </tr>
        
        <tr>
          <td>
            <label for="file-category-input">Categoría:</label>
          </td>
          <td>
            <select id="file-category-input" style="width: 100%;">
              <option value="Matemáticas">Matemáticas</option>
              <option value="Historia">Historia</option>
              <option value="Biología">Biología</option>
              <option value="Química">Química</option>
              <option value="Física">Física</option>
            </select>
          </td>
        </tr>

        <tr>
          <td> <button id="file-content-button" onclick="document.getElementById('file-content-input').click()">Seleccionar Archivo</button> </td>
          <td> <input id="file-content-input" type="file" style=display:none; /> <span id="file-content-text"></span></td>
        </tr>

        <tr>
          <button class="icon-button" id="save-file-input" @click="onSaveFileButtonClick();">Aceptar</button>
          <button class="icon-button" id="cancel-file-input" style="margin-left: 10px;" @click="onCancelFileButtonClick();">Cancelar</button>
        </tr>

      </table>

    </dialog>

  </div>
  `,
  data() {
    return {
      category: "",
      files: [],
      isLightTheme: true,
    }
  },
  methods: {
    async onOpenBookClick(key) { 
      //path = this.files[index].path;
      //name = this.files[index].name;

      console.log("onOpenBookClick key: " + key);

      const transaction = DATABASE.transaction("files", "readwrite");
      const store = transaction.objectStore("files");

      let file = await store.get(key)

      file.blob.name = file.name;

      console.log("file: ", file)

      const path = URL.createObjectURL(file.blob)

      window.open(path, '_blank').focus();
    },

    onAddFileButtonClick() {
      const addFileModal = document.getElementById("add-file-modal");

      addFileModal.showModal();
    },

    async onSaveFileButtonClick() {
      newFile = { name: '', category: '', description:'', path: '', blob: null}

      if (document.getElementById("file-content-input").value == '')
      {
        alert("debe seleccionar el archivo");

        return;
      }

      if (newFile.name = document.getElementById("file-name-input").value == '')
      {
        alert("debe especificar un nombre para el archivo");

        return;
      }

      newFile.name = document.getElementById("file-name-input").value;
      newFile.blob = document.getElementById("file-content-input").files[0]
      newFile.category = document.getElementById("file-category-input").value;

      const transaction = DATABASE.transaction("files", "readwrite");
      const store = transaction.objectStore("files");

      await store.put(newFile);

      // clear and close the modal
      document.getElementById("file-name-input").value = null;
      document.getElementById("file-content-input").value = null;
      document.getElementById("add-file-modal").close();

      this.loadFiles();
    },

    async onDeleteBookClick(key) {
      const transaction = DATABASE.transaction("files", "readwrite");
      const store = transaction.objectStore("files");

      await store.delete(key);

      await this.loadFiles()
    },

    async loadFiles() {
      console.log("loading files...")

      const transaction = DATABASE.transaction("files", "readonly");
      const store = transaction.objectStore("files");

      let items = []
      let keys = []

      if (this.category == '')
      {
        items = await store.getAll();
        keys = await store.getAllKeys();
      }
      else
      {
        let categoryIndex = store.index("files_category");

        items = await categoryIndex.getAll([this.category]);
        keys = await categoryIndex.getAllKeys([this.category]);
      }
      
      this.files = items;
  
      for (let i = 0; i < keys.length; i++)
      {
        this.files[i].key = keys[i];
      }

      console.log("  files loaded: (" + this.files.length + "): ", this.files)
    },

    onCancelFileButtonClick() {
      document.getElementById("file-name-input").value = null;
      document.getElementById("file-content-input").value = null;
      document.getElementById("add-file-modal").close();
    },

    changeTheme(){
      this.isLightTheme = !this.isLightTheme;

      const documentStyle = document.documentElement.style;

      if (this.isLightTheme)
      {
        documentStyle.setProperty("--background", "var(--background-light)");
        documentStyle.setProperty("--background-secondary", "var(--background-secondary-light)");
        documentStyle.setProperty("--text", "var(--text-light)");
        documentStyle.setProperty("--primary-accent", "var(--primary-accent-light)");
        documentStyle.setProperty("--secondary-accent", "var(--secondary-accent-light)");
        documentStyle.setProperty("--border", "var(--border-light)");
      }
      else
      {
        documentStyle.setProperty("--background", "var(--background-dark)");
        documentStyle.setProperty("--background-secondary", "var(--background-secondary-dark)");
        documentStyle.setProperty("--text", "var(--text-dark)");
        documentStyle.setProperty("--primary-accent", "var(--primary-accent-dark)");
        documentStyle.setProperty("--secondary-accent", "var(--secondary-accent-dark)");
        documentStyle.setProperty("--border", "var(--border-dark)");
      }
    },

    async aplicarFiltros()
    {
      this.category = document.getElementById("selected-category").value;

      await this.loadFiles();
    }
  },
  mounted() {
    console.log("onMounted homePage");

    this.loadFiles();

    document.getElementById("file-content-input").addEventListener("change", (event) => {
      document.getElementById("file-content-text").innerHTML = document.getElementById("file-content-input").files[0].name;
    });
  }
}