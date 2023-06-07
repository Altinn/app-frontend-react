import type { FixedLanguageList } from 'src/language/languages';

export function nn(): FixedLanguageList {
  return {
    actions: {
      sign: 'Signer',
      confirm: 'Bekreft',
      reject: 'Avslå',
      instantiate: 'Instansier',
    },
    address_component: {
      address: 'Gateadresse',
      care_of: 'C/O eller annan tilleggsadresse',
      house_number: 'Bustadnummer',
      house_number_helper:
        'Om addressa er felles for fleire bueiningar må du oppgi bustadnummer. Den består av ein bokstav og fire tal og skal vere ført opp ved/på inngangsdøra di.',
      post_place: 'Poststad',
      simplified: 'Enkel',
      title_text_binding: 'Søk etter ledetekst for Adressekomponenten',
      zip_code: 'Postnr',
      validation_error_zipcode: 'Postnummer er ugyldig. Eit postnummer består berre av 4 siffer.',
      validation_error_house_number: 'Bustadnummer er ugyldig',
    },
    confirm: {
      answers: 'Svara dine',
      attachments: 'Vedlegg',
      body: 'Du er no  klar for å sende inn {0}. Før du sender inn vil vi anbefale å sjå over svara dine. Du kan ikkje endre svara etter at du har sendt inn.',
      button_text: 'Send inn',
      deadline: 'Frist innsending',
      sender: 'Aktør',
      title: 'Sjå over svara dine før du sender inn',
    },
    date_picker: {
      invalid_date_message: 'Ugyldig datoformat. Bruk formatet {0}.',
      cancel_label: 'Avbryt',
      clear_label: 'Tøm',
      today_label: 'I dag',
      min_date_exeeded: 'Dato vald er før tidligaste dato tillat',
      max_date_exeeded: 'Dato vald er etter seinaste dato tillat',
      aria_label_icon: 'Opne datoveljar',
      aria_label_left_arrow: 'Førre månad.',
      aria_label_right_arrow: 'Neste månad.',
    },
    feedback: {
      title: '## Du blir snart vidaresendt',
      body: 'Vi venter på verifikasjon, når den er på plass blir du vidaresendt.',
    },
    form_filler: {
      back_to_summary: 'Attende til samandrag',
      error_report_header: 'Du må retta desse feila før du kan gå vidare',
      error_required: 'Du må fylle ut {0}',
      file_upload_valid_file_format_all: 'alle',
      file_uploader_add_attachment: 'Legg til fleire vedlegg',
      file_uploader_drag: 'Dra og slepp eller',
      file_uploader_find: 'leit etter fil',
      file_uploader_list_delete: 'Slett vedlegg',
      file_uploader_list_header_file_size: 'Filstorleik',
      file_uploader_list_header_name: 'Namn',
      file_uploader_list_header_status: 'Status',
      file_uploader_list_status_done: 'Ferdig lasta',
      file_uploader_list_header_delete_sr: 'Slett',
      file_uploader_max_size: 'Maks filstorleik',
      file_uploader_mb: 'MB.',
      file_uploader_upload: 'Last opp fil',
      file_uploader_number_of_files: 'Tal på filer',
      file_uploader_valid_file_format: 'Tillatne filformat er:',
      file_uploader_validation_error_delete: 'Noko gjekk galt under slettinga av fila, prøv igjen seinare.',
      file_uploader_validation_error_exceeds_max_files_1: 'Du kan ikkje laste opp fleire enn',
      file_uploader_validation_error_exceeds_max_files_2: 'filer. Ingen filer blei lasta opp.',
      file_uploader_validation_error_file_ending: 'er ikkje blant dei tillatne filtypane.',
      file_uploader_validation_error_file_number_1: 'For å halde fram må du laste opp',
      file_uploader_validation_error_file_number_2: 'vedlegg',
      file_uploader_validation_error_file_size: 'overskrid tillatt filstorleik.',
      file_uploader_validation_error_general_1: 'Det var eit problem med fila',
      file_uploader_validation_error_general_2:
        '. Forsikre deg om at fila har rett filtype og ikkke overskrid maks filstorleik.',
      file_uploader_validation_error_upload: 'Noko gjekk galt under opplastinga av fila, prøv igjen seinare.',
      file_uploader_validation_error_update: 'Noko gjekk galt under oppdateringa av filas merking, prøv igjen seinare.',
      file_uploader_validation_error_no_chosen_tag: 'Du må velja',
      placeholder_receipt_header: 'Skjemaet er no fullført og sendt inn.',
      placeholder_user: 'OLA PRIVATPERSON',
      required_description: 'Obligatoriske felter er markert med *',
      required_label: '*',
      summary_item_change: 'Endre',
      summary_go_to_correct_page: 'Gå til riktig side i skjema',
      address: 'Gateadresse',
      careOf: 'C/O eller annan tilleggsadresse',
      houseNumber: 'Bustadnummer',
      postPlace: 'Poststed',
      zipCode: 'Postnr',
    },
    navigation: {
      main: 'Appnavigasjon',
      form: 'Skjemanavigasjon',
      to_main_content: 'Hopp til hovedinnholdet',
      go_to_task: 'Gå til {0}',
    },
    general: {
      action: 'Handling',
      accessibility: 'Tilgjengelegheit',
      add_connection: 'Legg til tilkobling',
      add_new: 'Legg til ny',
      add: 'Legg til',
      back: 'Attende',
      cancel: 'Avbryt',
      choose_label: 'Vel namn',
      choose_method: 'Vel metode',
      choose: 'Vel',
      close_schema: 'Lukk skjema',
      close: 'Lukk',
      contains: 'Inneheld',
      control_submit: 'Kontroller og send inn',
      create_new: 'Opprett ny',
      create: 'Opprett',
      customer_service_phone_number: '+47 75 00 60 00',
      delete: 'Slett',
      disabled: 'Deaktivert',
      done: 'Ferdig',
      edit_alt_error: 'Rett feil her',
      edit_alt: 'Rediger',
      edit: 'Endre',
      empty_summary: 'Du har ikkje lagt inn informasjon her',
      enabled: 'Aktivert',
      error_message_with_colon: 'Feilmelding:',
      expand_form: 'Utvid skjema',
      for: 'for',
      header_profile_icon_label: 'Profil ikon knapp',
      label: 'Namn',
      loading: 'Lastar innhald',
      log_out: 'Logg ut',
      next: 'Neste',
      no_options: 'Ingen alternativ tilgjengleg',
      optional: 'Valfri',
      print_button_text: 'Print / Lagre PDF',
      progress: 'Side {0} av {1}',
      required: 'Obligatorisk',
      save: 'Lagre',
      save_and_close: 'Lagre og lukk',
      save_and_next: 'Lagre og opne neste',
      search: 'Søk',
      select_field: 'Vel felt',
      service_description_header: 'Beskriving',
      service_name: 'Tenestenamn',
      service_owner: 'Tenesteeigar',
      service_saved_name: 'Lagringsnamn',
      submit: 'Send inn',
      validate_changes: 'Validér endringar',
      value: 'Verdi',
      version: 'Versjon',
    },
    group: {
      row_error: 'Ei av radene er ikkje fylt ut riktig. Dette må bli retta før skjema kan sendast inn.',
      row_popover_delete_message: 'Er du sikker på at du vil sletta denne rada?',
      row_popover_delete_button_confirm: 'Ja, slett rada',
    },
    iframe_component: {
      unsupported_browser_title: 'Nettlesaren din støttas ikkje',
      unsupported_browser:
        'Nettlesaren di støttar ikkje iframes som brukar srcdoc. Dette kan føre til at du ikkje ser all innhaldet som er meint å visast her. Vi anbefalar deg å prøve ein annan nettlesar.',
    },
    input_components: {
      character_limit_sr_label: 'Tekstfeltet kan innehalde maks {0} teikn.',
      remaining_characters: 'Du har {0} teikn igjen',
      exceeded_max_limit: 'Du har overskride maks teikn med {0}',
    },
    instance_selection: {
      changed_by: 'Endra av',
      continue: 'Hald fram her',
      description: 'Vel om du vil halde fram med eit skjema du har byrja på, eller om du vil starte på ny.',
      header: 'Du har allereie starta å fylle ut dette skjemaet.',
      last_changed: 'Sist endra',
      left_of: 'Hald fram der du slapp',
      new_instance: 'Start på nytt',
    },
    instantiate: {
      all_forms: 'alle skjema',
      inbox: 'innboks',
      profile: 'profil',
      unknown_error_title: 'Ukjent feil',
      unknown_error_text: 'Det har skjedd ein ukjent feil, ver venleg prøv igjen seinare.',
      unknown_error_status: 'Ukjent feil',
      unknown_error_customer_support: 'Om problemet hald fram, ta kontakt med oss på brukarservice {0}.',
      forbidden_action_error_title: 'Du manglar rett til å utføre denne handlinga',
      forbidden_action_error_text: 'Det ser ut til at du ikkje har rett til å utføre denne handlinga.',
      forbidden_action_error_status: '403 - Forbidden',
      forbidden_action_error_customer_support: 'Om du treng hjelp, ta kontakt med oss på brukarservice <br/> {0}.',
      authorization_error_main_title: 'Du manglar rett til å sjå denne tenesta.',
      authorization_error_instantiate_validation_title: 'Du kan ikkje starte denne tenesta',
      authorization_error_rights: 'Det ser ut til at du ikkje har rett til å starte denne tenesta for {0}',
      authorization_error_ask:
        'Om du representerer ein person, er det den du representerer som kan gi deg dei naudsynte rettane til å starte tenesta. Representerer du ein organisasjon er det personar som har rolla tilgangsstyring innad i organisasjonen som kan gi deg dei naudsynte rettane.',
      authorization_error_check_rights:
        '<a href="https://{0}/ui/Profile/" target="_blank">Sjå kven som har rolla tilgangsstyring under "Andre med rettar til verksemda"</a>.',
      authorization_error_info_rights:
        '<a href="https://{0}/hjelp/profil/roller-og-rettigheter/" target="_blank">Her finn du meir informasjon om roller og rettar</a>.',
      authorization_error_info_customer_service: 'Du kan også kontakte oss på brukarservice {0}.',
      authorization_error_instantiate_validation_info_customer_service:
        'Om du står fast kontakt oss på brukarservice {0}.',
      starting: 'Vent litt, vi hentar det du treng',
    },
    language: {
      full_name: {
        nb: 'Norsk bokmål',
        en: 'Engelsk',
        nn: 'Nynorsk',
      },
      selector: {
        label: 'Språk',
      },
    },
    party_selection: {
      error_caption_prefix: 'Feil',
      invalid_selection_first_part: 'Du har starta tenesta som',
      invalid_selection_second_part: 'Denne tenesta er kun tilgjengeleg for',
      invalid_selection_third_part: 'Vel ny aktør under.',
      no_valid_selection_first_part: 'Dette er ei teneste for {0}',
      no_valid_selection_second_part:
        'Det ser ut som du ikkje har tilgang til ein aktør som har lov til å starte <b>{0}</b>.',
      no_valid_selection_third_part: 'For å starte denne tenesta må du ha tilgangar som knytter deg til ein {0}.',
      no_valid_selection_binding_word: 'og',
      change_party: 'skift aktør her',
      read_more_roles_link: 'Her finn du meir informasjon om roller og rettar',
      binding_word: 'eller',
      header: 'Kven vil du sende inn for?',
      load_more: 'Last fleire',
      search_placeholder: 'Søk etter aktør',
      subheader: 'Dine aktørar som kan starte tenesta:',
      unit_type_private_person: 'privatperson',
      unit_type_company: 'verksmd',
      unit_type_bankruptcy_state: 'konkursbo',
      unit_type_subunit: 'undereining',
      unit_type_subunit_plural: 'undereiningar',
      unit_deleted: 'sletta',
      unit_org_number: 'org.nr.',
      unit_personal_number: 'personnr.',
      show_deleted: 'Vis sletta',
      show_sub_unit: 'Vis undereiningar',
      why_seeing_this: 'Kvifor ser eg dette?',
      seeing_this_preference:
        'Du kan endra profilinnstillingane dine for å ikkje bli spurt om aktør kvar gong du startar utfylling av eit nytt skjema. Du finn denne innstillinga under **Profil** > **Avanserte innstillingar** > **Eg ønskjer ikkje å bli spurt om aktør kvar gong eg startar utfylling av eit nytt skjema**.',
      seeing_this_override: 'Denne appen er sett opp til å alltid spørja om aktør.',
    },
    helptext: {
      button_title: 'Hjelp',
      button_title_prefix: 'Hjelpetekst for',
    },
    receipt: {
      attachments: 'Vedlegg',
      body: 'Det er gjennomført ein maskinell kontroll under utfylling, men vi tek atterhald om at det kan bli oppdaga feil under sakshandsaminga og at annan dokumentasjon kan vere naudsynt. Ver venleg oppgi referansenummer ved eventuelle førespurnadar til etaten.',
      body_simple:
        'Av tryggleiksomsyn vil verken innhaldet i tenesta eller denne meldinga vere synleg i Altinn etter at du har forlate denne sida.',
      date_sent: 'Dato sendt',
      receiver: 'Mottakar',
      receipt: 'Kvittering',
      ref_num: 'Referansenummer',
      sender: 'Avsendar',
      subtitle: 'Kopi av kvitteringa di er sendt til ditt arkiv',
      title: 'Skjema er sendt inn',
      title_submitted: 'Følgjande er sendt inn:',
    },
    receipt_platform: {
      attachments: 'Vedlegg',
      date_sent: 'Dato sendt',
      helper_text:
        'Det er gjennomført ein maskinell kontroll under utfylling, men vi tek atterhald om at det kan bli oppdaga feil under sakshandsaminga og at annan dokumentasjon kan vere naudsynt. Ver venleg oppgi referansenummer ved eventuelle førespurnadar til etaten.',
      is_sent: 'er sendt inn',
      receipt: 'Kvittering',
      receiver: 'Mottakar',
      reference_number: 'Referansenummer',
      sender: 'Avsendar',
      sent_content: 'Følgjande er sendt inn:',
      log_out: 'Logg ut',
      profile_icon_aria_label: 'Profil ikon knapp',
    },
    soft_validation: {
      info_title: 'Lurt å tenke på',
      warning_title: 'OBS',
      success_title: 'Så flott!',
    },
    validation: {
      generic_field: 'dette feltet',
    },
    validation_errors: {
      min: 'Minste gyldige tall er {0}',
      max: 'Største gyldige tall er {0}',
      minLength: 'Bruk {0} eller fleire teikn',
      maxLength: 'Bruk {0} eller færre teikn',
      length: 'Antall tillatne teikn er {0}',
      pattern: 'Feil format eller verdi',
      required: 'Feltet er påkravd',
      enum: 'Kun verdiane {0} er tillatne',
    },
    map_component: {
      selectedLocation: 'Valt lokasjon: {0}° nord, {1}° øst',
      noSelectedLocation: 'Ingen lokasjon valt',
    },
    multiple_select_component: {
      no_options: 'Ingen valg tilgjengelig',
      placeholder: 'Velg...',
    },
    list_component: {
      rowsPerPage: 'Rader per side',
      of: 'av',
      navigateFirstPage: 'Naviger til første side i tabell',
      previousPage: 'Førre side i tabell',
      nextPage: 'Neste side i tabell',
      navigateLastPage: 'Naviger til siste side i tabell',
    },
  };
}
