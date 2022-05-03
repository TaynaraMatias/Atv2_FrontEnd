const URL_API = "http://app.professordaniloalves.com.br";

/* MENU */
$('.scrollSuave').click(() => {
    $('html, body').animate(
        { scrollTop: $(event.target.getAttribute('href')).offset().top - 100 }, 500);
});


/* ENVIAR CADASTRO */

$("#cadastroDeAcordo").change(function(){
    $("#btnSubmitCadastro").attr("disabled", !this.checked);
});


const formularioCadastro = document.getElementById("formCadastro");
formularioCadastro.addEventListener("submit", enviarFormularioCadastro, true);

function enviarFormularioCadastro(event) {
    event.preventDefault();

        $("#formCadastro .invalid-feedback").remove();
        $("#formCadastro .is-invalid").removeClass("is-invalid");
    
        fetch(URL_API + "/api/v1/cadastro", {
            method: "POST",
            headers: new Headers({
                Accept: "application/json",
                'Content-Type': "application/json",
            }),
            body: JSON.stringify({
                nomeCompleto: document.getElementById("cadastroNomeCompleto").value,
                dataNascimento: document.getElementById("cadastroDataNascimento").value,
                sexo: document.querySelector("[name=cadastroSexo]:checked").value,
                cep: document.getElementById("cadastroCep").value,
                cpf: document.getElementById("cadastroCpf").value,
                cidade: document.getElementById("cadastroCidade").value,
                uf: document.getElementById("cadastroUf").value,
                logradouro: document.getElementById("CadastroLogradouro").value,
                numeroLogradouro: document.getElementById("CadastroNumeroLogradouro").value
            })
        })
            .then(response => {
                return new Promise((myResolve, myReject) => {
                    response.json().then(json => {
                        myResolve({ "status": response.status, json });
                    });
                });
            }).then(response => {
                if (response && response.status===422 && response.json.errors) {
                    Object.entries(response.json.errors).forEach((obj, index) => {
                        const campo = obj[0];
                        const id = "cadastro" + campo.charAt(0).toUpperCase()+campo.substring(1);
                        const texto = obj[1][0];
                        criarDivImcDeCampoInvalido(id, texto, index == 0);
                    })
                } else {
                    $("#resultadoIMC").html(response.json.message);
                    $('#modalResultadoIMC').modal('show');
                }
            }).catch(err => {
                $("#resultadoIMC").html("Ocorreu um erro ao cadastrar.");
                $('#modalResultadoIMC').modal('show');
                console.log(err);
            });   
      
    
/* FIM ENVIAR CADASTRO */

/* CRIAR LISTA DE ESTADOS */


function popularListaEstados() {
    fetch(URL_API + "/api/v1/endereco/estados", {
        headers: new Headers({
            Accept: "application/json"
        })
    })
    .then(response => {
        return response.json();
    }).then(estados => {
        const elSelecetUF = document.getElementById("cadastroUf");
        estados.forEach((estado) => {
            elSelecetUF.appendChild(criarOption(estado.uf, estado.nome));
        })
    }).catch(err => {
        alert("Erro ao salvar cadastro");
        console.log(err);
    })

}

function criarOption(valor, texto) {
    const node = document.createElement("option");
    const textnode = document.createTextNode(texto)
    node.appendChild(textnode);
    node.value = valor;
    return node;
}

/* FIM CRIAR LISTA DE ESTADOS */


/* PREENCHER ENDEREÇO */
function popularEnderecoCadastro(cep){
    alert("Requer implementação...");
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then(response => {
    return response.json();
    })
    .then(endereco => {
    document.getElementById("cadastroUf").value = endereco.uf;
    document.getElementById("cadastroCidade").value = endereco.localidade;
    document.getElementById("cadastroLogradouro").value = endereco.logradouro;
    })
    .catch(err => {
    alert("Erro ao consultar serviço");
    console.log(err);
    })
    }

    $(document).ready(function() {

        function limpa_formulário_cep() {
            // Limpa valores do formulário de cep.
            $("#cadastroLogradouro").val("");
            $("#cadastroCidade").val("");
            $("#cadastroUf").val("");
            
        
        //Quando o campo cep perde o foco.
        $("#cadastroCep").blur(function() {

            //Nova variável "cep" somente com dígitos.
            var cep = $(this).val().replace(/\D/g, '');

            //Verifica se campo cep possui valor informado.
            if (cep != "") {

                //Expressão regular para validar o CEP.
                var validacep = /^[0-9]{8}$/;

                //Valida o formato do CEP.
                if(validacep.test(cep)) {

                    //Preenche os campos com "..." enquanto consulta webservice.
                    $("#cadastroLogradouro").val("...");
                    $("#cadastroCidade").val("...");
                    $("#cadastroUf").val("...");
                    

                    //Consulta o webservice viacep.com.br/
                    $.getJSON("https://viacep.com.br/ws/"+ cep +"/json/?callback=?", function(dados) {

                        if (!("erro" in dados)) {
                            //Atualiza os campos com os valores da consulta.
                            $("#cadastroLogradouro").val(dados.logradouro);
                            $("#cadastroCidade").val(dados.localidade);
                            $("#cadastroUf").val(dados.uf);
                        } //end if.
                        else {
                            //CEP pesquisado não foi encontrado.
                            limpa_formulário_cep();
                            alert("CEP não encontrado.");
                        }
                    });
                } //end if.
                else {
                    //cep é inválido.
                    limpa_formulário_cep();
                    alert("Formato de CEP inválido.");
                }
            } //end if.
            else {
                //cep sem valor, limpa formulário.
                limpa_formulário_cep();
            }
        });
    };

}

popularEnderecoCadastro(cep);
limpa_formulário_cep();
    
/* FIM PREENCHER ENDEREÇO */

/* IMC */

$('#btnCalcularIMC').click(() => {
    $("#resultadoIMC").html("");
    $("#formImc .invalid-feedback").remove();
    $("#formImc .is-invalid").removeClass("is-invalid");

    fetch(URL_API + "/api/v1/imc/calcular", {
        method: "POST",
        headers: new Headers({
            Accept: "application/json",
            'Content-Type': "application/json",
        }),
        body: JSON.stringify({
            peso: document.getElementById("pesoImc").value,
            altura: document.getElementById("alturaImc").value,
        })
    })
        .then(response => {
            return new Promise((myResolve, myReject) => {
                response.json().then(json => {
                    myResolve({ "status": response.status, json });
                });
            });
        }).then(response => {
            if (response && response.json.errors) {
                Object.entries(response.json.errors).forEach((obj, index) => {
                    const id = parseIdImc(obj[0]);
                    const texto = obj[1][0];
                    criarDivImcDeCampoInvalido(id, texto, index == 0);
                })
            } else {
                $("#resultadoIMC").html(response.json.message);
                $('#modalResultadoIMC').modal('show');
            }
        }).catch(err => {
            $("#resultadoIMC").html("Ocorreu um erro ao tentar calcular seu IMC.");
            $('#modalResultadoIMC').modal('show');
            console.log(err);
        });

});

function parseIdImc(id) {
    return id + "Imc";
}

function criarDivImcDeCampoInvalido(idItem, textoErro, isFocarNoCampo) {
    const el = document.getElementById(idItem);
    isFocarNoCampo && el.focus();
    el.classList.add("is-invalid");
    const node = document.createElement("div");
    const textnode = document.createTextNode(textoErro);
    node.appendChild(textnode);
    const elDiv = el.parentElement.appendChild(node);
    elDiv.classList.add("invalid-feedback");
}

/* FIM IMC */