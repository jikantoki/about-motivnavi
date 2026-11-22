FROM httpd:2.4-alpine

# 必要なモジュールを有効化し、追加設定を読み込む
RUN sed -i \
      -e 's/^#\(LoadModule headers_module .*\)/\1/' \
      -e 's/^#\(LoadModule deflate_module .*\)/\1/' \
      -e 's/^#\(LoadModule filter_module .*\)/\1/' \
      /usr/local/apache2/conf/httpd.conf \
 && echo 'Include conf/extra/motivnavi.conf' >> /usr/local/apache2/conf/httpd.conf

COPY apache/motivnavi.conf /usr/local/apache2/conf/extra/motivnavi.conf
COPY htdocs/ /usr/local/apache2/htdocs/

EXPOSE 80
