namespace Form {

  const createMultipleChoiceGrid = (form, question, helpText) =>
    form.addGridItem()
      .setTitle(question)
      .setHelpText(helpText)
      .setRows(['You...'])
      .setColumns(['Have room to do more', 'Are spot on', 'Are smashing it'])
      .setRequired(true)

  const createFormHead = (form, title) => {
    form.setTitle(title)
    form.addSectionHeaderItem().setTitle('First a little bit about you')
    form.addTextItem().setTitle('What\'s your first name?').setRequired(true)
    form.addTextItem().setTitle('What\'s your surname?').setRequired(true)
    return form
  }

  const createFormTail = (form, isPersonal) => {
    const youThey = isPersonal ? 'you' : 'they'
    form.addPageBreakItem().setTitle('General Feedback')
    form.addTextItem().setTitle(`Generally, what things should ${youThey} keep doing`).setRequired(true)
    form.addTextItem().setTitle(`What things could ${youThey} focus on improving`).setRequired(true)
    return form
  }

  const createEngineerForm = (title: string, isPersonal: boolean) => {
    const theWhatQuestions = [
      ['Execution', 'Delivers against commitments with a high degree of accuracy and quality'],
      ['Consistency', 'Continually generates impactful results over extended periods of time'],
      ['Quality', 'Consistently writes production-ready code that is easily testable, understood by others and accounts for edge cases and errors'],
      ['Design & Architecture', 'Architects using accepted patterns, allowing for iterative, autonomous development and future scaling. Anticipates future use, making design decisions that minimise the cost of future changes.']
    ]
    const theHowQuestions = [
      ['Problem Solving', 'Solve tough problems with insightful, practical solutions, making wise deicisions despite ambiguity and thinks strategically'],
      ['Curiosity', 'Demonstrates an active, open mind by uncovering and exploring big ideas that accelerate genuine progress for Funding Circle'],
      ['Accountability', 'Promotes a culture of openness, accountability and trust. Generates a progressive attitude through team norms and behaviours.'],
      ['Communication', 'Listens well and is concise and articulate. I treat people with respect and consideration'],
      ['Delivery', 'Shows a bias to actions, delivering excellent results over just following a process'],
      ['Grit', 'Steadfast in the pursuit of the goals of the organistaion, their teams, their colleagues and themselves.'],
      ['People Orientation', 'Provides support to colleagues, expresses gratitude, spreads knowledge and develops people outside formal reporting or team structures'],
      ['Emotional Intelligence', 'Takes time to understand what motivates other, shows empathy and deepens gneuine relationships with others'],
      ['Craft', 'Inspires others by passionately promoting practices to create excellent quality products and services'],
      ['Purpose', 'shows conviction over time, developing a sense of purpose for what they do']
    ]
    const form = FormApp.create(title).setProgressBar(true)
    createFormHead(form, title)
    form.addPageBreakItem().setTitle('The What')
    theWhatQuestions.forEach(([k, v]) => createMultipleChoiceGrid(form, k, v))
    form.addPageBreakItem().setTitle('The How (Our Values)')
    theHowQuestions.forEach(([k, v]) => createMultipleChoiceGrid(form, k, v))
    createFormTail(form, isPersonal)
    return form
  }

  const createProductForm = (title: string, isPersonal: boolean) => {
    const questions = [
      ['Problem solving', 'They explain and simplify the problem space. They collaborate with you to find solutions and how it can be broken down.'],
      ['Domain knowledge', 'They understand the business and tech space to a deep level so that they can have effective discussions and make informed decisions with you. They can see things from your perspective and they can also challenge concepts and assumptions.'],
      ['Vision and Goals', 'They have a clear view of where we\'re, what we need to achieve as a team and why. You buy into this vision and the goals set by the Product Manager'],
      ['Communication', 'They are concise and articulate in their communication to you. You come away from interactions with a better understanding and clear actions, NOT confused. Thay use a variety of tools/techniques to make their communication effective. You feel they give you space to feedback and they take on what you say. They help you by re-clarifying thing if you don\'t understand.'],
      ['Accountability', 'They own the domain with you. They succeed and fail with you and help you through challenges.'],
      ['Roadmap', 'They layout a roadmap so that you clearly know the high level path to achieving the vision and goals they set out. You know what the current priorities are, what\'s happening now and what\'s coming next and byeond.'],
      ['Delivery', 'They support and motivate you through delivery. Clearing the way when blockers arise and\or supporting you when things are delivered.'],
      ['People Orientation', 'They support you as a team member by taking the time to help you understand issues, working with you on solving problems and delivering together. They protect and support you and the team when things aren\'t going well and/or they support your team through deliveries and issues.'],
      ['Adaptability', 'They are able to adapt to changing situations and uncertainty, covering where there are gaps and esnuring the team and the stakeholders keep moving as a whole.']
    ]
    const form = FormApp.create(title).setProgressBar(true)
    createFormHead(form, title)
    form.addPageBreakItem().setTitle('Their Role')
    questions.forEach(([k, v]) => createMultipleChoiceGrid(form, k, v))
    createFormTail(form, isPersonal)
    return form
  }

  export function createFeedbackForm(
    title: string,
    isPersonal: boolean,
    role: string
  ) {
    if(role === Constants.PRODUCT_MANAGER) {
      return createProductForm(title, isPersonal)
    } else {
      return createEngineerForm(title, isPersonal)
    }
  }
}
