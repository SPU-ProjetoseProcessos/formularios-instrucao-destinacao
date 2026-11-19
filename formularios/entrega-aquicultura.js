/* Gerado por gerar_dados.py a partir de 'SEI_59162916_Formulario.pdf'. Não editar à mão. */
window.FORMULARIOS = window.FORMULARIOS || {};
window.FORMULARIOS['entrega-aquicultura'] = {
 "id": "entrega-aquicultura",
 "nome": "Entrega para Aquicultura",
 "regime": "02.03.02",
 "condicoes_fixas": {
  "T09": "outra"
 },
 "fluxos": [
  "F08.025"
 ],
 "carimbo": "Protótipo em validação",
 "titulo": "Formulário de Análise de Entrega para fins de Aquicultura",
 "origem": {
  "documento_sei": "59162916",
  "processo": "19739.022676/2024-33",
  "versao": "versão 3 CGDIN/SNA spu/uf 05/2024",
  "nome_no_sei": "Formulário",
  "unidade": "DEDES / CGDIN / Coordenação de Infraestrutura"
 },
 "legislacao": [
  {
   "t": "Lei nº 9.636/1998",
   "url": "https://www.planalto.gov.br/ccivil_03/leis/l9636.htm"
  },
  {
   "t": "Decreto-Lei nº 9.760/1946",
   "url": "https://www.planalto.gov.br/ccivil_03/decreto-lei/del9760.htm"
  },
  {
   "t": "Portaria Conjunta SAP/MAPA e SPU/ME nº 396/2021",
   "url": "https://www.in.gov.br/en/web/dou/-/portaria-conjunta-sap/mapa-spu/seddm/me-n-396-de-16-de-setembro-de-2021-346235040"
  },
  {
   "t": "Decreto nº 10.576/2020",
   "url": "https://www.planalto.gov.br/ccivil_03/_Ato2019-2022/2020/Decreto/D10576.htm"
  },
  {
   "t": "Portaria MGI nº 11.384/2025",
   "url": "https://www.in.gov.br/web/dou/-/portaria-mgi-n-11.384-de-23-de-dezembro-de-2025-677963681"
  },
  {
   "t": "Portaria SPU/MGI nº 11.424/2025",
   "url": "https://www.in.gov.br/web/dou/-/portaria-spu/mgi-n-11.424-de-24-de-dezembro-de-2025-677988935"
  },
  {
   "t": "Portaria SPU/MGI nº 11.423/2025",
   "url": "https://www.in.gov.br/web/dou/-/portaria-spu/mgi-n-11.423-de-24-de-dezembro-de-2025-677975386"
  },
  {
   "t": "Parecer nº 00113/2022/NUCJUR/E-CJU/PATRIMÔNIO/CGU/AGU",
   "url": "https://sapiens.agu.gov.br/valida_publico?id=828157754"
  },
  {
   "t": "Consultoria Jurídica da União - e-CJU",
   "url": "https://www.gov.br/agu/pt-br/composicao/cgu/cgu/ecju/patrimonio"
  },
  {
   "t": "SPU Normas - Atos Normativos",
   "url": "https://colaborativo-spu.economia.gov.br/normas-atos-lista/1"
  },
  {
   "t": "Lei nº 9.051/1995",
   "url": "https://www.planalto.gov.br/ccivil_03/Leis/L9051.htm"
  },
  {
   "t": "Lei nº 9.784/1999",
   "url": "https://www.planalto.gov.br/ccivil_03/LEIS/L9784.htm"
  }
 ],
 "links": [
  {
   "texto": "Portaria Conjunta SAP/MAPA e SPU/ME nº 396/2021",
   "url": "https://www.in.gov.br/en/web/dou/-/portaria-conjunta-sap/mapa-spu/seddm/me-n-396-de-16-de-setembro-de-2021-346235040"
  },
  {
   "texto": "DECRETO Nº 10.576, DE 14 DE DEZEMBRO DE 2020",
   "url": "https://www.planalto.gov.br/ccivil_03/_Ato2019-2022/2020/Decreto/D10576.htm"
  },
  {
   "texto": "Portal Colaborativo",
   "url": "https://colaborativo-spu.economia.gov.br/"
  },
  {
   "texto": "LINK",
   "url": "https://www.gov.br/ana/pt-br/assuntos/regulacao-e-fiscalizacao/outorga/outorgas-emitidas/arquivos/outorgas-emitidas-ao-mpa/@@download/file"
  }
 ],
 "secoes": [
  {
   "n": "1",
   "titulo": "Dados do processo e do requerente",
   "itens": [
    {
     "n": "1.1",
     "titulo": "NUP",
     "tipo": "campos",
     "ajuda": "Informar o número do processo no SEI MGI e SEI MPA.",
     "campos": [
      {
       "k": "mgi",
       "r": "NUP/MGI",
       "fmt": "nup"
      },
      {
       "k": "mpa",
       "r": "NUP/MPA",
       "fmt": "nup"
      }
     ]
    },
    {
     "n": "1.2",
     "titulo": "Requerente",
     "tipo": "fixo",
     "texto": [
      "Secretaria Nacional de Aquicultura - SNA, do Ministério da Pesca e Aquicultura - MPA"
     ],
     "ajuda": "Conforme § 2º do art. 4º, do DECRETO Nº 10.576, DE 14 DE DEZEMBRO DE 2020."
    },
    {
     "n": "1.3",
     "titulo": "Natureza do interessado/beneficiário",
     "tipo": "fixo",
     "texto": [
      "Administração Pública Federal Direta",
      "CNPJ: 49.381.076/0001-01"
     ],
     "lembrete": [
      {
       "p": "O Anexo II da Portaria Conjunta SAP/MAPA e SPU/ME nº 396/2021 - Modelo de Termo de Entrega para Aquicultura, não exige o preenchimento do CNPJ na qualificação das partes."
      }
     ]
    },
    {
     "n": "1.4",
     "titulo": "Data de cadastramento no Portal Colaborativo",
     "tipo": "campos",
     "campos": [
      {
       "k": "data",
       "r": "Data de cadastramento",
       "fmt": "data"
      },
      {
       "k": "sei",
       "r": "Doc. SEI nº",
       "fmt": "docsei",
       "doc": "Cadastro no Portal Colaborativo"
      }
     ]
    }
   ]
  },
  {
   "n": "2",
   "titulo": "Requisitos para a entrega à Secretaria Nacional de Aquicultura",
   "itens": [
    {
     "n": "2.1",
     "titulo": "Requerimento contendo Memorial descritivo, com coordenadas UTM dos vértices das poligonais das áreas pleiteadas",
     "tipo": "uma",
     "sei": true,
     "ajuda": "O requerimento contém o memorial descritivo?",
     "opcoes": [
      {
       "t": "Sim."
      },
      {
       "t": "Não. Notificar o requerente.",
       "alerta": "Item 2.1: o requerimento não contém o memorial descritivo. Notificar o requerente."
      }
     ]
    },
    {
     "n": "2.2",
     "titulo": "Justificativa com a breve descrição do sistema produtivo informada no requerimento, para a escolha do local",
     "tipo": "longo"
    },
    {
     "n": "2.3",
     "titulo": "Classificação da área aquícola, de acordo com objetivo para o qual se destina",
     "tipo": "uma",
     "opcoes": [
      {
       "t": "Interesse econômico"
      },
      {
       "t": "Interesse social"
      },
      {
       "t": "Pesquisa ou extensão"
      },
      {
       "t": "Não informado"
      }
     ],
     "lembrete": [
      {
       "p": "A não indicação da classificação da área aquícola no requerimento não obsta o seu prosseguimento, mas é importante que a SPU conheça esses dados, inclusive quanto a ausência da informação, quando não houver, pois são importantes para a avaliação e melhoria da política e dos normativos.",
       "se": {
        "item": "2.3",
        "op": [
         3
        ]
       }
      }
     ]
    },
    {
     "n": "2.4",
     "titulo": "Qualificação do(a) representante da Secretaria Nacional de Aquicultura - SNA/MAPA",
     "tipo": "uma",
     "opcoes": [
      {
       "t": "Sim.",
       "campos": [
        {
         "k": "nome",
         "r": "Nome"
        },
        {
         "k": "portaria",
         "r": "Cópia da Portaria de Nomeação — Doc. SEI nº",
         "fmt": "docsei",
         "doc": "Portaria de Nomeação"
        }
       ]
      },
      {
       "t": "Não. Solicitar a documentação ausente.",
       "alerta": "Item 2.4: falta a qualificação do(a) representante da SNA. Solicitar a documentação ausente."
      }
     ],
     "lembrete": [
      {
       "p": "A apresentação do documento de qualificação do(a) é condição para celebração do termo de entrega, podendo o processo seguir para o GE-DESUP, com ressalvas.",
       "se": {
        "item": "2.4",
        "op": [
         1
        ]
       }
      }
     ]
    }
   ]
  },
  {
   "n": "3",
   "titulo": "Identificação, caracterização e avaliação do espaço físico em águas públicas para fins de aquicultura",
   "itens": [
    {
     "n": "3.1",
     "titulo": "Município/UF",
     "tipo": "campos",
     "campos": [
      {
       "k": "estado",
       "r": "Estado",
       "fmt": "uf"
      },
      {
       "k": "municipio",
       "r": "Município",
       "fmt": "municipio"
      }
     ]
    },
    {
     "n": "3.2",
     "titulo": "Corpo hídrico (nome da área)",
     "tipo": "texto"
    },
    {
     "n": "3.3",
     "titulo": "Tipo do corpo hídrico, conforme requerimento",
     "tipo": "uma",
     "opcoes": [
      {
       "t": "Mar territorial"
      },
      {
       "t": "Rio Federal"
      },
      {
       "t": "Reservatório de Usina Hidrelétrica"
      },
      {
       "t": "Outro",
       "campos": [
        {
         "k": "outro",
         "r": "Especifique"
        }
       ]
      }
     ]
    },
    {
     "n": "3.3.1",
     "titulo": "Se o tipo do Corpo Hídrico for Rio Federal ou Reservatório de Usina Hidrelétrica, informe",
     "tipo": "campos",
     "se": {
      "item": "3.3",
      "op": [
       1,
       2
      ]
     },
     "ajuda": "Para requerimentos posteriores ao DECRETO Nº 10.576, DE 14 DE DEZEMBRO DE 2020: informe o número da outorga.",
     "campos": [
      {
       "k": "bacia",
       "r": "I - Bacia Hidrográfica"
      },
      {
       "k": "rio",
       "r": "II - Rio Formador"
      },
      {
       "k": "outorga",
       "r": "Número da outorga de direito de uso de recursos hídricos emitida pela Agência Nacional de Águas"
      },
      {
       "k": "sem_outorga",
       "r": "Outorga",
       "fmt": "checks",
       "valores": [
        [
         "ni",
         "Número da outorga não informado"
        ]
       ],
       "alertas": {
        "ni": "Item 3.3.1: número da outorga de direito de uso de recursos hídricos não informado."
       }
      }
     ],
     "lembrete": [
      {
       "p": "A necessidade de outorga de direito de uso de recursos hídricos para a prática da aquicultura pela Agência Nacional de Águas é uma exigência do art. 9º do Decreto 10.576/2020. Caso a informação não tenha sido fornecida no requerimento de que trata o item 2.1 deste formulário, o processo deverá seguir com ressalvas para o GE-DESUP, para que a informação seja apresentada antes da celebração do termo de entrega."
      },
      {
       "p": "Observação 1: O número da outorga de direito de uso de recursos hídricos emitida pela Agência Nacional de Águas, quando não informado, poderá ser pesquisado no planilha disponibilizada pela ANA no LINK ou ser solicitado à Secretaria Nacional de Aquicultura, por meio do e-mail spu.deu@mpa.gov.br."
      },
      {
       "p": "Observação 2: Mediante justificativa da Secretaria Nacional de Aquicultura, o termo de entrega poderá ser celebrado sem o número da outorga de direito de uso de recursos hídricos emitida pela Agência Nacional de Águas, desde que conste no termo a obrigação da SNA obtê-lo antes da celebração do contrato de cessão com os beneficiários da política."
      }
     ]
    },
    {
     "n": "3.4",
     "titulo": "Área da poligonal a ser entregue/cedida",
     "tipo": "campos",
     "campos": [
      {
       "k": "area",
       "r": "Área da poligonal a ser entregue/cedida (m²)",
       "fmt": "area",
       "motor": "area"
      }
     ]
    },
    {
     "n": "3.5",
     "titulo": "Memorial descritivo",
     "tipo": "fixo",
     "texto": [
      "Respondido no item 2.1"
     ]
    },
    {
     "n": "3.6",
     "titulo": "Valor do imóvel",
     "tipo": "campos",
     "sei": true,
     "campos": [
      {
       "k": "valor",
       "r": "Valor do imóvel (R$)",
       "fmt": "moeda",
       "motor": "valor"
      }
     ],
     "lembrete": [
      {
       "p": "O valor de retribuição definido pela SNA/MPA para a cessão da área não equivale, necessariamente, ao valor de avaliação, que deve ser pautados por estimativas técnicas fundamentadas, para sua evidenciação contábil, observando onde couber a Instrução Normativa nº 67, de 20 de setembro de 2022."
      }
     ]
    },
    {
     "n": "3.7",
     "titulo": "Situação ocupacional",
     "tipo": "uma",
     "opcoes": [
      {
       "t": "Ocupado",
       "campos": [
        {
         "k": "desde",
         "r": "Ocupado desde",
         "fmt": "data"
        }
       ]
      },
      {
       "t": "Desocupado"
      }
     ]
    },
    {
     "n": "3.8",
     "titulo": "Eventuais problemas jurídicos, ambientais ou administrativos",
     "tipo": "uma",
     "ajuda": "Há demandas judiciais ou do Ministério Público envolvidas no presente processo ou nos processos relacionados? Eventuais problemas jurídicos, ambientais ou administrativos a serem destacados? Se sim, qual o conteúdo e eventuais implicações para o ocupação? Em que documento ou processo SEI estão relacionados?",
     "opcoes": [
      {
       "t": "Não há"
      },
      {
       "t": "Desconhecido"
      },
      {
       "t": "Sim",
       "campos": [
        {
         "k": "quais",
         "r": "Especifique",
         "longo": true
        }
       ]
      }
     ]
    },
    {
     "n": "3.9",
     "titulo": "Informação se o imóvel já recebeu, ou não, uma Proposta de Aquisição de Imóveis - PAI",
     "tipo": "fixo",
     "texto": [
      "Não se aplica"
     ]
    }
   ]
  },
  {
   "n": "4",
   "titulo": "Justificativa fundamentada para o ato",
   "itens": [
    {
     "n": "4.1",
     "titulo": "Fundamento da entrega",
     "tipo": "fixo",
     "texto": [
      "Trata-se de entrega ao SNA/MAPA, de espaços físicos em corpos d'água de domínio da União, para fins de aquicultura, em conformidade com a previsão expressa do art. 79, do Decreto-Lei nº 9.760/1946, art. 40 da Lei nº 9.636/1998, Decreto nº 10.576/2020 e Portaria Conjunta SAP/MAPA - SPU/SEDDM/ME Nº 396, de 16 de setembro de 2021.",
      "Conforme disposto no § 6-A do art. 18 da Lei nº 9.636, de 1998, os espaços físicos em corpos d’água de domínio da União para fins de aquicultura, no âmbito da regularização aquícola desenvolvida por órgãos ou entidades da administração pública serão cedidos ao requerente que tiver projeto aprovado perante a Secretaria de Aquicultura e Pesca do Ministério da Agricultura, Pecuária e Abastecimento e demais órgãos da administração pública."
     ]
    }
   ]
  },
  {
   "n": "5",
   "titulo": "Especificidades do processo",
   "itens": [
    {
     "n": "5.1",
     "titulo": "Eventuais informações adicionais sobre imóvel ou sobre área que precisem ser destacados ou informados",
     "tipo": "uma",
     "opcoes": [
      {
       "t": "Há informações a destacar",
       "campos": [
        {
         "k": "quais",
         "r": "Especifique",
         "longo": true
        }
       ]
      },
      {
       "t": "Não há"
      }
     ]
    }
   ]
  },
  {
   "n": "6",
   "titulo": "Competência legal — autoridade decisória e governança",
   "itens": [
    {
     "n": "6.1",
     "titulo": "Autoridade competente",
     "tipo": "fixo",
     "confere": {
      "comp": "superintendente"
     },
     "texto": [
      "Superintendente do Patrimônio da União (subdelegada no Art. 1º, Inciso VII, da Portaria SPU/MGI nº 11.424/2025)"
     ]
    },
    {
     "n": "6.2",
     "titulo": "Análise de governança e instância competente",
     "tipo": "uma",
     "governanca": [
      "cde"
     ],
     "governanca_sim": 1,
     "opcoes": [
      {
       "t": "NÃO se aplica manifestação prévia da CDE. Imóveis com valor de referência inferior a R$ 100.000.000,00 (cem milhões de reais). Fundamento: Portaria SPU/MGI nº 11.423/2025, art. 2º, inciso I (interpretação sistemática)."
      },
      {
       "t": "APLICA-SE manifestação prévia da CDE Imóveis com valor de referência igual ou superior a R$ 100.000.000,00 (cem milhões de reais). Fundamento: Portaria MGI Nº 11.384/2025, art. 10º, §1º, inciso I; Portaria SPU/MGI nº 11.423/2025, art. 2º, inciso I."
      }
     ]
    }
   ]
  },
  {
   "n": "7",
   "titulo": "Conclusão da análise",
   "intro": [
    {
     "p": "Considerando a análise técnica efetuada, por meio deste formulário, com fundamento na legislação de regência e especialmente na Portaria Conjunta SAP/MAPA e SPU/ME nº 396/2021, propõem-se:"
    }
   ],
   "itens": [
    {
     "n": "7",
     "titulo": "Proposta",
     "tipo": "uma",
     "conclusao": true,
     "antes_fecho": [
      {
       "p": "Ressalta-se que a finalização e posterior assinatura do Termo de Entrega, está condicionada à obtenção de todos os documentos e autorizações exigíveis na ocasião, bem como à rigorosa observância das normas legais e regulamentares aplicáveis, especialmente quanto ao disposto na Portaria Conjunta SAP/MAPA e SPU/ME nº 396/2021."
      }
     ],
     "opcoes": [
      {
       "n": "7.1",
       "t": "A NOTIFICAÇÃO DA SNA/MPA, para a complementação da documentação.",
       "fecho": "notifica",
       "campos": [
        {
         "k": "razoes",
         "r": "Documentos e/ou esclarecimentos a serem apresentados pelo requerente à SPU-UF",
         "longo": true
        }
       ],
       "fecho_texto": "Assim, diante do exposto, verifica-se que o processo não se encontra suficientemente instruído (Informar qual: 0, 1 ou 2), devendo ser notificada a SNA/MPA para apresentar a informação/documentação complementar listada no item 7.1."
      },
      {
       "n": "7.2",
       "t": "O INDEFERIMENTO do requerimento, visto verificar-se que o presente processo NÃO reúne os requisitos para a Entrega, notificando-se o requerente.",
       "fecho": "nega",
       "campos": [
        {
         "k": "razoes",
         "r": "Principais ressalvas/impedimentos do processo, indicando o item correspondente do formulário",
         "longo": true
        }
       ],
       "fecho_texto": "Assim, diante do exposto, conclui-se que o processo não reúne os requisitos legais e técnicos necessários à formalização da Entrega (Informar qual: 0, 1 ou 2), recomendando-se o INDEFERIMENTO do requerimento, em face das razões expostas no item 7.2."
      },
      {
       "n": "7.3",
       "t": "Manifestação técnica FAVORÁVEL, sem ressalvas, à Entrega do imóvel.",
       "fecho": "favoravel",
       "campos": [
        {
         "k": "cde",
         "r": "Manifestação prévia",
         "fmt": "radio",
         "manif": {
          "dispensada": [
           "sem_manifestacao",
           "ge_desup"
          ],
          "submetida": [
           "cde"
          ]
         },
         "valores": [
          [
           "dispensada",
           "Dispensada a manifestação prévia da CDE, encontrando-se o processo apto a prosseguir para deliberação pela instância competente no âmbito da SPU, visto que se verificou que o presente processo reúne os requisitos para a Entrega."
          ],
          [
           "submetida",
           "Submetido à manifestação prévia da CDE, como etapa de verificação de mérito e conformidade, previamente à deliberação pela instância competente no âmbito da SPU, visto que se verificou que o presente processo reúne os requisitos para a Entrega."
          ]
         ]
        }
       ],
       "fecho_texto": "Diante do exposto, verifica-se que o processo se encontra devidamente instruído e em conformidade com os requisitos legais e normativos aplicáveis, estando apto à deliberação pela autoridade competente no âmbito desta SPU/UF."
      },
      {
       "n": "7.4",
       "t": "Manifestação técnica FAVORÁVEL, com ressalvas, à Entrega do imóvel.",
       "fecho": "favoravel",
       "campos": [
        {
         "k": "cde",
         "r": "Manifestação prévia",
         "fmt": "radio",
         "manif": {
          "dispensada": [
           "sem_manifestacao",
           "ge_desup"
          ],
          "submetida": [
           "cde"
          ]
         },
         "valores": [
          [
           "dispensada",
           "Dispensada a manifestação prévia da CDE, podendo o processo seguir para deliberação pela instância competente no âmbito da SPU."
          ],
          [
           "submetida",
           "Submetido à manifestação prévia da CDE, como etapa de verificação de mérito e conformidade, razão pela qual o processo se encontra apto a prosseguir para deliberação pela instância competente no âmbito da SPU, condicionada ao atendimento das ressalvas consignadas nesta análise."
          ]
         ]
        },
        {
         "k": "ressalvas",
         "r": "Principais ressalvas/impedimentos do processo, indicando o item correspondente do formulário",
         "longo": true
        }
       ],
       "fecho_texto": "Assim, conclui-se que o processo se encontra apto à deliberação pela autoridade competente no âmbito desta SPU/UF, condicionada ao atendimento das ressalvas ora consignadas (Informar qual: 0, 1 ou 2), devendo ser adotadas as providências administrativas cabíveis."
      }
     ]
    }
   ]
  }
 ],
 "encaminhamento": [],
 "fecho": {}
};
