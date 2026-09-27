import click
from . import create_app
from .extensions import db
from .models import User
app=create_app()
@app.cli.command("bootstrap-admin")
def bootstrap_admin():
    import os
    mobile=os.getenv("BOOTSTRAP_ADMIN_MOBILE"); password=os.getenv("BOOTSTRAP_ADMIN_PASSWORD"); name=os.getenv("BOOTSTRAP_ADMIN_NAME","System Admin")
    if not mobile or not password: raise click.ClickException("Set BOOTSTRAP_ADMIN_MOBILE and BOOTSTRAP_ADMIN_PASSWORD in .env")
    u=User.query.filter_by(mobile=mobile).first()
    if u: u.role="admin"; u.name=name; u.set_password(password)
    else: u=User(mobile=mobile,name=name,role="admin"); u.set_password(password); db.session.add(u)
    db.session.commit(); click.echo(f"Admin ready for mobile {mobile}")
if __name__=="__main__": app.cli.main()
