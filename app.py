import os
import cherrypy

class SimpleNote:
    @cherrypy.expose
    def index(self):
        with open('index.html', 'r') as html_file:
            return html_file.read()

    @cherrypy.expose
    @cherrypy.tools.json_out()
    @cherrypy.tools.json_in()
    def add_note(self):
        input_json = cherrypy.request.json
        note = input_json['note']
        return {"note": note}

if __name__ == '__main__':
    conf = {
        '/': {
            'tools.sessions.on': True,
            'tools.staticdir.root': os.path.abspath(os.getcwd())
        },
        '/static': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': 'static'
        }
    }
    cherrypy.quickstart(SimpleNote(), '/', conf)


