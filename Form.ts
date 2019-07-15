namespace Form {

  const createMultipleChoiceGrid = (form, question, helpText) =>
    form.addGridItem()
      .setTitle(question)
      .setHelpText(helpText)
      .setRows(['You...'])
      .setColumns(['Have room to do more', 'Are spot on', 'Are smashing it'])
      .setRequired(true)

  export function createFeedbackForm(title: string, isPersonal: boolean) {
    const youThey = isPersonal ? 'you' : 'they'
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
    form.setTitle(title)
    form.addSectionHeaderItem().setTitle('First a little bit about you')
    form.addTextItem().setTitle('What\'s your first name?').setRequired(true)
    form.addTextItem().setTitle('What\'s your surname?').setRequired(true)
    form.addPageBreakItem().setTitle('The What')
    theWhatQuestions.forEach(([k, v]) => createMultipleChoiceGrid(form, k, v))
    form.addPageBreakItem().setTitle('The How (Our Values)')
    theHowQuestions.forEach(([k, v]) => createMultipleChoiceGrid(form, k, v))
    form.addPageBreakItem().setTitle('General Feedback')
    form.addTextItem().setTitle(`Generally, what things should ${youThey} keep doing`).setRequired(true)
    form.addTextItem().setTitle(`What things could ${youThey} focus on improving`).setRequired(true)
    return form
  }
}
