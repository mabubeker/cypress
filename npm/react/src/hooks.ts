export function setupHooks (rootId: string) {
  // @ts-ignore
  const isComponentSpec = () => true

  // When running component specs, we cannot allow "cy.visit"
  // because it will wipe out our preparation work, and does not make much sense
  // thus we overwrite "cy.visit" to throw an error
  Cypress.Commands.overwrite('visit', (visit, ...args: any[]) => {
    if (isComponentSpec()) {
      throw new Error(
        'cy.visit from a component spec is not allowed',
      )
    } else {
      // allow regular visit to proceed
      return visit(...args)
    }
  })

  /** This needs only for the old experimentalComponentTesting approach. The dev-server will automatically inject the __cy__root element*/
  function renderTestingPlatform () {
    // Let's mount components under a new div with this id

    if (document.getElementById(rootId)) {
      return
    }

    const rootNode = document.createElement('div')

    rootNode.setAttribute('id', rootId)
    document.getElementsByTagName('body')[0].prepend(rootNode)

    const selector = `#${rootId}`

    return cy.get(selector, { log: false })
  }

  before(() => {
    if (!isComponentSpec()) {
      return
    }

    renderTestingPlatform()
  })

  /**
   * Remove any style or extra link elements from the iframe placeholder
   * left from any previous test
   *
   */
  function cleanupStyles () {
    if (!isComponentSpec()) {
      return
    }

    const styles = document.body.querySelectorAll('style')

    styles.forEach((styleElement) => {
      if (styleElement.parentElement) {
        styleElement.parentElement.removeChild(styleElement)
      }
    })

    const links = document.body.querySelectorAll('link[rel=stylesheet]')

    links.forEach((link) => {
      if (link.parentElement) {
        link.parentElement.removeChild(link)
      }
    })
  }

  beforeEach(cleanupStyles)
}
