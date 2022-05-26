from django.core.files import File
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required


@login_required
@csrf_exempt
def dump_database(request):
    db_filename = 'db/schedulio.sqlite'
    dbfile = File(open(db_filename, "rb"))
    response = HttpResponse(dbfile, content_type='application/x-sqlite3')
    output_filename = 'schedulio.sqlite'
    response['Content-Disposition'] = 'attachment; filename=%s' % output_filename
    response['Content-Length'] = dbfile.size
    return response
