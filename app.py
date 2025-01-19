from app import create_app
import sys

app = create_app()

if __name__ == '__main__':
    if 1 < len(sys.argv):
        # 引数がある場合は、その引数をポート番号として使う
        port_number = int(sys.argv[1])
        app.run(port=port_number)
    else:
        app.run()
