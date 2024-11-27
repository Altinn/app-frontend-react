import type { FixedLanguageList, NestedTexts } from 'src/language/languages';

export function nn(): FixedLanguageList {
  return {
    altinn: {
      standard_validation: {
        file_content_type_not_allowed:
          'Det ser ut som du prøver å lasta opp ein filtype som ikkje er tillaten. Sjekk at fila faktisk er av den typen han gir seg ut for å vera.',
      },
    },
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
        'Om adressa er felles for fleire bueiningar må du oppgi bustadnummer. Den består av ein bokstav og fire tal og skal vere ført opp ved/på inngangsdøra di.',
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
    custom_actions: {
      general_error: 'Noko gjekk gale med denne handlinga. Prøv igjen seinare.',
    },
    date_picker: {
      invalid_date_message: 'Ugyldig datoformat. Bruk formatet {0}.',
      cancel_label: 'Avbryt',
      clear_label: 'Tøm',
      today_label: 'I dag',
      min_date_exeeded: 'Dato vald er før tidlegaste dato tillat',
      max_date_exeeded: 'Dato vald er etter seinaste dato tillat',
      aria_label_icon: 'Opne datoveljar',
      aria_label_left_arrow: 'Førre månad.',
      aria_label_right_arrow: 'Neste månad.',
      aria_label_year_dropdown: 'Vel år',
      aria_label_month_dropdown: 'Vel månad',
      format_text: 'Til dømes {0}',
    },
    feedback: {
      title: '## Du blir snart vidaresendt',
      body: 'Vi venter på verifikasjon, når den er på plass blir du vidaresendt.',
    },
    form_filler: {
      error_add_subform: 'Det oppstod ein feil ved oppretting av underskjema, ver vennleg og prøv igjen.',
      error_delete_subform: 'Noko gjekk gale ved sletting av underskjema, ver venleg og prøv igjen',
      error_fetch_subform: 'Feil ved lasting av skjemadata',
      error_max_count_reached_subform_server: 'Maksimalt tal på {0} oppføringar er nådd',
      error_max_count_reached_subform_local: 'Maksimalt tal på {0} oppføringar er nådd ({1})',
      error_min_count_not_reached_subform: 'Minst {0} {1} oppføring er påkravd',
      error_validation_inside_subform: 'Det er feil i ein eller fleire {0} oppføringar',
      subform_default_header: 'Oppføringer',
      alert_confirm: 'Bekreft',
      checkbox_alert: 'Er du sikker på at du vil fjerne avkrysningen?',
      multi_select_alert: 'Er du sikker på at du vil slette <b>{0}</b>?',
      dropdown_alert: 'Er du sikker på at du vil endre til <b>{0}</b>?',
      back_to_summary: 'Attende til samandrag',
      error_report_header: 'Du må retta desse feila før du kan gå vidare',
      error_required: 'Du må fylle ut {0}',
      file_upload_valid_file_format_all: 'alle',
      file_uploader_add_attachment: 'Legg til fleire vedlegg',
      file_uploader_drag: 'Dra og slepp eller',
      file_uploader_find: 'leit etter fil',
      file_uploader_list_delete: 'Slett vedlegg',
      file_uploader_delete_warning: 'Er du sikker på at du vil sletta dette vedlegget?',
      file_uploader_delete_button_confirm: 'Ja, slett vedlegg',
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
      file_uploader_validation_error_exceeds_max_files:
        'Du kan ikkje laste opp fleire enn {0} filer. Ingen filer blei lasta opp.',
      file_uploader_validation_error_file_ending: 'er ikkje blant dei tillatne filtypane.',
      file_uploader_validation_error_file_number: 'For å halde fram må du laste opp {0} vedlegg',
      file_uploader_validation_error_file_size: '{0} overskrid tillatt filstorleik.',
      file_uploader_validation_error_general:
        'Det var eit problem med fila {0}. Forsikre deg om at fila har rett filtype og ikkje overskrid maks filstorleik.',
      file_uploader_validation_error_upload: 'Noko gjekk galt under opplastinga av fila, prøv igjen seinare.',
      file_uploader_validation_error_update: 'Noko gjekk galt under oppdateringa av filas merking, prøv igjen seinare.',
      file_uploader_validation_error_no_chosen_tag: 'Du må velja {0}',
      placeholder_receipt_header: 'Skjemaet er no fullført og sendt inn.',
      placeholder_user: 'OLA PRIVATPERSON',
      radiobutton_alert_label: 'Er du sikker på at du vil endre frå {0}?',
      required_description: 'Obligatoriske felt er markerte med *',
      required_label: '*',
      summary_item_change: 'Endre',
      summary_go_to_correct_page: 'Gå til riktig side i skjema',
      address: 'Gateadresse',
      careOf: 'C/O eller annan tilleggsadresse',
      houseNumber: 'Bustadnummer',
      postPlace: 'Poststad',
      zipCode: 'Postnr',
      no_options_found: 'Fann ingen treff',
      clear_selection: 'Fjern alle valde',
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
      accessibility_url: 'https://info.altinn.no/nn/om-altinn/tilgjengelighet/',
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
      customer_service_slack: 'https://altinn.slack.com/',
      customer_service_email: 'servicedesk@altinn.no',
      delete: 'Slett',
      download: 'Nedlasting {0}',
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
      no_options: 'Ingen alternativ tilgjengeleg',
      optional: 'Valfri',
      page_number: 'Side {0}',
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
      wait_for_attachments: 'Vent litt, vi prosesserer vedlegg',
      part_of_form_completed: 'Denne delen av skjemaet er ikkje tilgjengeleg. Du kan ikkje gjere endringar her no',
      invalid_task_id: 'Denne delen av skjemaet finst ikkje.',
      navigate_to_current_process: 'Gå til rett prosesstrinn',
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
      remaining_characters: 'Du har {0} av {1} teikn igjen',
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
        '<a href="https://{0}/hjelp/profil/enkelttjenester-og-roller/" target="_blank">Her finn du meir informasjon om roller og rettar</a>.',
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
      unit_type_company: 'verksemd',
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
        'Du kan endra [profilinnstillingane](https://altinn.no/ui/Profile) dine for å ikkje bli spurt om aktør kvar gong du startar utfylling av eit nytt skjema. Du finn denne innstillinga under **Profil** > **Avanserte innstillingar** > **Eg ønskjer ikkje å bli spurt om aktør kvar gong eg startar utfylling av eit nytt skjema**.',
      seeing_this_override: 'Denne appen er sett opp til å alltid spørja om aktør.',
    },
    payment: {
      pay: 'Betal',
      summary: 'Oppsummering',
      alert: {
        paid: 'Du har betalt!',
        failed: 'Betalinga feilet',
      },
      receipt: {
        title: 'Betalingskvittering',
        payment_id: 'Betalings ID',
        altinn_ref: 'Altinn referanse',
        payment_date: 'Dato for kjøp',
        total_amount: 'Total beløp',
        receiver: 'Mottaker',
        payer: 'Betaler',
        name: 'Navn',
        company_name: 'Firmanavn',
        org_number: 'Organisasjonsnummer',
        contact_person: 'Kontaktperson',
        contact_phone: 'Kontakttelefon',
        contact_email: 'Kontakt-e-post',
        phone: 'Telefon',
        address: 'Addresse',
        org_num: 'Organisasjonsnummer',
        account_number: 'Kontonummer',
        card_number: 'Kortnummer',
        card_expiry: 'Utløpsdato',
        email: 'E-post',
      },
      component: {
        description: 'Beskrivelse',
        quantity: 'Antall',
        price: 'Pris',
        total: 'Totalt',
        vat: 'MVA',
      },
    },
    organisation_lookup: {
      orgnr_label: 'Organisasjonsnummer',
      from_registry_description: 'Frå enhetsregisteret',
      validation_error_not_found: 'Organisasjonsnummeret er ikkje funne i registeret',
      validation_invalid_response_from_server: 'Ugyldig respons frå server',
      validation_error_forbidden: 'Du har ikkje rett til å søkje opp dette organisasjonsnummeret',
      validation_error_too_many_requests: 'For mange førespurnader. Ver venleg og prøv igjen seinare',
      unknown_error: 'Ukjent feil. Ver venleg og prøv igjen seinare',
      validation_error_orgnr: 'Organisasjonsnummeret er ugyldig',
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
      min: 'Minste gyldige tal er {0}',
      max: 'Største gyldige tal er {0}',
      minLength: 'Bruk {0} eller fleire teikn',
      maxLength: 'Bruk {0} eller færre teikn',
      length: 'Antall tillatne teikn er {0}',
      pattern: 'Feil format eller verdi',
      required: 'Feltet er påkravd',
      enum: 'Kun verdiane {0} er tillatne',
      minItems: 'Minst {0} radar er påkrevd',
      maxItems: 'Maks {0} radar er tillatne',
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
    config_error: {
      layoutset_subform_config_error_customer_support:
        'Om du treng hjelp kan du nå Altinn på:<br/><br/>Telefon: <a href="tel:{0}">{0}</a><br/>E-post: {1}<br/>Slack: {2}',
      layoutset_subform_config_error:
        'Layout set med id <strong>{0}</strong> er feilkonfigurert.<br /><br />Layout set kan ikkje ha både <strong>type</strong> <em>og</em> <strong>tasks</strong> definert.',
      layoutset_error: 'Layout set error',
      component_has_errors: 'Ein feil oppstod for <code>{0}</code>:',
      component_has_errors_after:
        'Medan du har feil i konfigurasjonen kan me ikkje vise komponenten i skjemaet. Rett opp i feila og prøv igjen.',
      subform_no_datatype_layoutset: 'Datatype-spesifikasjon ikkje funnen i layout-sets.json.',
      subform_no_datatype_appmetadata: "Datatype '{0}' vart ikkje funnen i applicationmetadata.json.",
      subform_misconfigured_add_button:
        "Datatype '{0}' er markert som 'disallowUserCreate=true', men underskjema-komponenten er konfigurert med 'showAddButton=true'. Dette er ei motseiing, Sidan brukaren aldri vil få lov til å utføre handlingane bak legg-til knappen.",
    },
    version_error: {
      version_mismatch: 'Versjonsfeil',
      version_mismatch_message:
        'Denne versjonen av app frontend er ikkje kompatibel med den versjonen av backend-biblioteka du brukar. Oppdater til nyaste versjon av pakkane og prøv igjen.',
      min_backend_version: 'Minimum backend versjon er {0}',
    },
    missing_row_id_error: {
      title: 'Manglar rad-ID',
      message:
        'Når data blei lasta inn mangla det ein rad-ID. Dette er ein feil i konfigurasjonen av skjemaet, og må rettast opp ved hjelp av migreringsverktøya. Sjekk loggane i utviklarverktøya for meir informasjon.',
      full_message:
        'Datamodellen manglar eigenskapen {0} i stien {1}. Dette skal automatisk bli lagt til i datamodellen dersom du brukar riktig versjon av nuget-pakkane og har køyrt migreringsverktøya. Les meir om verktøya i dokumentasjonen: https://docs.altinn.studio/community/changelog/app-nuget/v8/migrating-from-v7/',
    },
    likert: {
      left_column_default_header_text: 'Spørsmål',
    },
    process_error: {
      submit_error_please_retry: 'Noko gjekk gale med innsending, prøv igjen om nokre minutt.',
    },
    pdfPreview: {
      error: 'Kunne ikkje førehandsvise PDF',
      defaultButtonText: 'Førehandsvis PDF',
    },
  } satisfies NestedTexts;
}
