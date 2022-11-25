<template>
    <v-container>
      <v-card>
        <v-card-title>
          <span class="text-h6 font-weight-light">Users Admin</span>
          <v-spacer></v-spacer>
          <v-btn color="success" @click="dialog=true;">New User</v-btn>
        </v-card-title>
        <v-card-text>
          <v-data-table
            :headers="headers"
            :items="users"
            class="elevation-1"
            :search="search"
          >
          <template v-slot:item.state="{ item }">
            <v-chip
              v-if="item.state == 1"
              class="ma-2"
              color="green"
              text-color="white"
            >
              Activo
            </v-chip>
            <v-chip
              v-if="item.state == 0"
              class="ma-2"
              color="red"
              text-color="white"
            >
              Inactivo
            </v-chip>
          </template>
          <template v-slot:item.action="{ item }">
            <v-btn text icon @click="beginItem(item)">
            <v-icon color="info" small>mdi-pencil</v-icon>
            </v-btn>

            <v-btn text icon>
            <v-icon color="error" small :loading="loading_delete" @click="destroy(item)">mdi-trash-can</v-icon>
            </v-btn>
          </template>
          </v-data-table>
        </v-card-text>
      </v-card>

      <v-dialog
        v-model="dialog"
        persistent
        width="700px"
        transition="dialog-bottom-transition"
        z-index="10"
      >
    <v-card>
        <v-card-title >
        <span class="display-1 font-weight-bold">{{ formTitle }}</span>
        <v-spacer></v-spacer>
        <v-btn icon>
        <v-icon small color="error" @click="closeAndClearModal">mdi-window-close</v-icon>
        </v-btn>
        </v-card-title>

        <v-card-text>
            <v-form ref="form">
                <v-row>
                    <v-col cols="6">
                        <v-text-field
                        v-model="username"
                        label="Código de Usuario"
                        outlined
                        dense
                        ></v-text-field>

                        <v-text-field
                            v-model.trim="email"
                            :rules="[rules.email, rules.max.email]"
                            label="Correo Electrónico"
                            type="email"
                            dense
                            outlined
                        ></v-text-field>

                        <v-text-field
                            v-model="PASSWORD"
                            :rules="[rules.required, rules.max.password]"
                            :type="showPassworText ? 'text' : 'password'"
                            label="Contraseña"
                            dense
                            outlined
                            :append-icon="showPassworText ? 'mdi-eye' : 'mdi-eye-off'"
                            @click:append="showPassworText = !showPassworText"
                        ></v-text-field>
                    </v-col>

                    <v-col cols="6">
                      <v-text-field
                        v-model ="name"
                        :rules="[rules.required, rules.caracteres, rules.max.nombre]"
                        label="Nombre del Usuario"
                        outlined
                        dense
                      ></v-text-field>

                      <v-text-field
                        v-model ="dateofbirth"
                        label="Fecha de Nacimiento"
                        outlined
                        dense
                        type="date"
                      ></v-text-field>
                      <v-text-field
                        v-model="id_user"
                        outlined
                        dense
                        label="Usuario ID"
                        disabled
                        ></v-text-field>  
                    </v-col>
                      <v-autocomplete
                      v-if="editedIndex > -1"
                      v-model="id_perfil"
                      outlined
                      dense
                      :items="perfiles"
                      item-text="nombre"
                      item-value="id"
                      ></v-autocomplete>
                      <v-btn-toggle
                             v-model="EstCodBtn"
                              color="green"
                              background-color="white"
                              rounded
                              @change="EstCodMet"
                              >
                        <v-btn value="1">
                                Activo
                        </v-btn>
                      </v-btn-toggle>
                          
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-row align="center" justify="center">
                            <v-btn color="primary" fab @click="saveUser">
                                <v-icon>mdi-cloud-download-outline</v-icon>
                            </v-btn>
                        </v-row>
                    </v-col>
                </v-row>
            </v-form>
        </v-card-text>
    </v-card>
</v-dialog>
    </v-container>
    
  </template>
  
  <script>
    import axios from 'axios';
    import moment from 'moment'
    import { required, minLength } from 'vuelidate/lib/validators'
    export default {
      name: 'HomeUsers.vue',
  
      data: () => ({
        headers: [
          {text: "Id", value: "id", sortable: false},
          {text: "UserName", value: "username", sortable: false},
          {text: "Name", value: "name", sortable: false},
          {text: "Email", value: "email", sortable: false},
          {text: "Date of birth", value: "dateofbirth", sortable: false},
          {text: "State", value: "state", sortable: false},
          {text: "Actions", value: "action", sortable: false}
        ],
        EstCodBtn: '',
        rules: {
          required: value => !!value || 'Campo requerido',
          caracteres: value => {
            const pattern = /((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9])))$/
            return pattern.test(value) || 'No se permiten caracteres'
          },
          spaces: v => (v || '').indexOf(' ') < 0 || 'No se permiten espacios',
          max: {
            password: v => v.length <= 10 || 'Máximo 10 caracteres',
            codusuario: v => v.length <= 20 || 'Máximo 20 caracteres',
            nombre: v => v.length <= 60 || 'Máximo 60 caracteres',
            email: v => v.length <= 100 || 'Máximo 100 caracteres'
          },
          email: v => (v === '' || (v.length > 0 && /.+@.+\..+/.test(v))) || 'Correo electronico no valido',
          num: value => {
            const pattern = /^[0-1]$/
            return pattern.test(value) || 'Numero no valido'
          },
          num2: value => {
            const pattern = /^[0-9]{1,2}$/
            return pattern.test(value) || 'Numero no valido'
          }
        },
        users: [],
        perfiles: [],
        editedIndex: -1,
        editedItem: [],
        username: '',
        PASSWORD: '',
        name: '',
        email: '',
        dateofbirth: '',
        state: '',
        id_perfil: '',      
        id_user: '',     
        dialog: false,
        search: '',
        loading_delete: false,
        showPassworText: false
      }),

      methods: {
        EstCodMet () {
          if (this.state == '1') {
            this.state = 0
          } else {
            this.state = 1
          }
        },
        async beginItem (item) {
          console.log(item)
          this.editedIndex = this.users.indexOf(item)
          this.editedItem = Object.assign(item)

          this.username = item.username
          this.PASSWORD = item.userpassword
          this.name = item.name
          this.email = item.email
          this.state = item.state
          this.id_user = item.id

          this.dateofbirth = item.dateofbirth
          if (parseInt(item.state) === 1) {
            this.EstCodBtn = '1'
          }
          this.rol = item.rol      
          this.showPassworText = false  
          this.perfilesUsuario()
          this.dialog = true
        },
        closeAndClearModal () {
          this.editedIndex = []
          this.editedItem = []
          this.EstCodBtn = '0'
          this.username = ''
          this.PASSWORD = ''
          this.name = ''
          this.email = ''
          this.dateofbirth = ''
          this.state = ''
          this.rol = ''        
          this.dialog = false
        },
        async saveUser () {
          if(this.editedIndex === -1){
            let params = {
            username : this.username,
            userpassword : this.PASSWORD,
            name: this.name,
            email: this.email, 
            dateofbirth: moment(this.dateofbirth).format('YYYY-MM-DD'),
            state: this.state,
          }
            await axios.post('https://6nmaz058ri.execute-api.us-east-1.amazonaws.com/Desarrollo/user', params ).then(response => (
              this.$toasted.success(response.message), this.closeAndClearModal(),this.getUsers()
            ))
          } else {
            let params = {
            username : this.username,
            userpassword : this.PASSWORD,
            name: this.name,
            email: this.email, 
            dateofbirth: moment(this.dateofbirth).format('YYYY-MM-DD'),
            state: this.state,
            id_perfil: this.id_perfil,
            id_user: this.id_user
          }
            await axios.put('https://6nmaz058ri.execute-api.us-east-1.amazonaws.com/Desarrollo/user', params).then(response => (
              this.$toasted.success(response.message),this.closeAndClearModal(),this.getUsers()
            ))
          }
        },
        async destroy(item) {
          await axios.delete('https://6nmaz058ri.execute-api.us-east-1.amazonaws.com/Desarrollo/user?id_user='+item.id).then(response => (
            this.$toasted.success(response.message),this.getUsers()
            ))
        },
        getUsers() {
          axios.get('https://6nmaz058ri.execute-api.us-east-1.amazonaws.com/Desarrollo/users').then(response => (this.users = response.data.content))
        }
      },
      computed: {
        formTitle () {
          return this.editedIndex === -1 ? 'Nuevo Usuario' : 'Editar Usuario'
        }
      },
      validations: {
        PASSWORD: {
          required,
          minLength: minLength(6)
        },
      },
      mounted () {
        this.getUsers()
        axios.get('https://6nmaz058ri.execute-api.us-east-1.amazonaws.com/Desarrollo/profiles').then(response => (this.perfiles = response.data.content))
      }
    }
  </script>
  