# API Insights Extension for Visual Studio Code

[API Insights](https://developer.cisco.com/site/api-insights/) is an open-source tool developed by Cisco which helps developers improve API quality and security. While API Insights runs as a remote service, the **API Insights Extension for Visual Studio Code** allows developers to leverage the functionalities of API Insights within their local IDE.

## Enhanced Productivity and Developer Experience

*	API Insights validates and scores API specifications against an organization’s guidelines on dimensions such as documentation completeness, API guidelines adherence, inclusive language, and runtime drift. This allows you to track and improve API quality consistently and efficiency.

*	Developers can use API Insights through its own dashboard interface, VS Code extension, local CLI, or as part of their GitHub CI/CD pipeline.

*	The CI/CD and VS Code extension capabilities of API Insights allow developers to Shift Left, allowing them to resolve spec issues early in the development cycle.

*	Leveraging API Insights as part of the code development process allows developers to detect and fix breaking changes, which significantly improves developer experience. The API Insights extension allows you to proactively detect and resolve issues within your local IDE.

## Get Started

### Installation
1. Download and install official Microsoft Visual Studio Code
2. Open VSCode Package Manager
3. Search for the official API Insights extension
3. Install [API Insights Extension for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=CiscoDeveloper.api-insights)


### Configuration

API Insights extension for Visual Studio Code works in two different modes:
* **Local Mode** - API Insights service is not connected
  - Validates local API specification files

* **Connected Mode** - API Insights remote service is configured and connected
  - Validates and scores API specs - validates and scores API specifications against an organization’s guidelines. This allows developers to track and improve API quality consistently and efficiently.
  - API lifecycle management - provides a trend timeline of API quality, and generates both API changelogs and diff comparisons of API versions to identify breaking changes.

### Connecting to API Insights service
If there is an API Insights remote service available, API Insights extension for Visual Studio Code can be configured to unlock features available in connected mode.

|Setting Item|Default Value|Description|
|--|--|--|
|API Insights: Endpoint URL| &lt;empty&gt; |The API endpoint exposed by API Insights remote service, required for extension to call its API|
|API Insights: Auth Type|None|Three Authorization Types are availeble: <br/><br/> **None**: service is public, authentication is disabled <br/><br/> **Token**: using HTTP Authorization request header:  <br/>```Authorization : <Token Type> <Token Value>```<br/> to authorize this extension, Token type is default to Bearer, token value is required <br/><br/> **OAuth**: using [OAuth 2.0 Client Credentials](https://datatracker.ietf.org/doc/html/rfc6749#section-1.3.4) flow to authorize this extension, Token URL, Client ID and Client Secret are all required|

## Development

1. Clone the repository and install dependencies
    ~~~ bash
    git clone https://github.com/cisco-developer/api-insights-extension-vscode
    cd api-insights-extension-vscode
    npm i
    ~~~
2. Open api-insights-extension-vscode folder in Visual Studio Code
3. Click 'Start Debugging' or 'Run Without Debugging' from Run menu
4. API Insights Extension for Visual Studio Code now runs in local mode, continue to setup an API Insights local instance to switch to connected mode:
    ~~~ bash
    git clone https://github.com/cisco-developer/api-insights
    cd api-insights
    docker-compose up
    ~~~
5. Now API Insights service is running at http://0.0.0.0:8081, open Settings in Visual Studio Code, set API Insights Endpoint URL to http://0.0.0.0:8081/v1/apiregistry/. For more information, please refer to [API Insights](https://github.com/cisco-developer/api-insights).
6. For more information, please refer to [API Insights Official Documentation](https://developer.cisco.com/docs/api-insights/#!using-the-api-insights-visual-studio-code-extension)

## Feedback

We want your feedback!

-   Upvote 👍 [feature requests](https://github.com/cisco-developer/api-insights-extension-vscode/issues?q=is%3Aissue+is%3Aopen+label%3Afeature-request+sort%3Areactions-%2B1-desc)
-   [Ask a question](https://github.com/cisco-developer/api-insights-extension-vscode/issues/new?labels=guidance&template=guidance_request.md)
-   [Request a new feature](https://github.com/cisco-developer/api-insights-extension-vscode/issues/new?labels=feature-request&template=feature_request.md)
-   [File an issue](https://github.com/cisco-developer/api-insights-extension-vscode/issues/new?labels=bug&template=bug_report.md)

## License

The **API Insights Extension for Visual Studio Code** is distributed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).
